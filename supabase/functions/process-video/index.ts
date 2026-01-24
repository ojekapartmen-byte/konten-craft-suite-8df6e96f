import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessVideoRequest {
  action: 'submit' | 'status' | 'cancel';
  videoUrl?: string;
  jobId?: string;
  operations?: VideoOperation[];
}

interface VideoOperation {
  type: 'trim' | 'resize' | 'compress' | 'watermark' | 'merge' | 'extract_audio' | 'add_audio';
  params?: Record<string, unknown>;
}

// Generate Transloadit signature using Web Crypto API
async function generateSignature(params: string, authSecret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(authSecret);
  const data = encoder.encode(params);
  
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-384" },
    false,
    ["sign"]
  );
  
  const signature = await globalThis.crypto.subtle.sign("HMAC", cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return "sha384:" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Build Transloadit steps for video processing
function buildSteps(operations: VideoOperation[], inputUrl: string) {
  const steps: Record<string, unknown> = {
    ":original": {
      robot: "/http/import",
      url: inputUrl,
    }
  };

  let previousStep = ":original";
  let stepIndex = 0;

  for (const op of operations) {
    const stepName = `step_${stepIndex}`;
    
    switch (op.type) {
      case 'trim':
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: 1920,
          height: 1080,
          resize_strategy: "fit",
          ffmpeg: {
            ss: op.params?.start || 0,
            t: op.params?.duration || 10,
          }
        };
        break;
        
      case 'resize':
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: Math.min(op.params?.width as number || 1920, 1920),
          height: Math.min(op.params?.height as number || 1080, 1080),
          resize_strategy: op.params?.strategy || "fit",
        };
        break;
        
      case 'compress':
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: 1920,
          height: 1080,
          resize_strategy: "fit",
          // Efficient bitrate for web
          video_bitrate: op.params?.bitrate || 2500,
        };
        break;
        
      case 'watermark':
        steps[`watermark_import_${stepIndex}`] = {
          robot: "/http/import",
          url: op.params?.imageUrl as string,
        };
        steps[stepName] = {
          robot: "/video/encode",
          use: {
            steps: [
              { name: previousStep, as: "video" },
              { name: `watermark_import_${stepIndex}`, as: "watermark" }
            ]
          },
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: 1920,
          height: 1080,
          watermark_position: op.params?.position || "bottom-right",
          watermark_size: op.params?.size || "15%",
        };
        break;
        
      case 'extract_audio':
        steps[stepName] = {
          robot: "/audio/encode",
          use: previousStep,
          preset: "mp3",
          ffmpeg_stack: "v6.0.0",
        };
        break;
        
      case 'add_audio':
        steps[`audio_import_${stepIndex}`] = {
          robot: "/http/import",
          url: op.params?.audioUrl as string,
        };
        steps[stepName] = {
          robot: "/video/merge",
          use: {
            steps: [
              { name: previousStep, as: "video" },
              { name: `audio_import_${stepIndex}`, as: "audio" }
            ]
          },
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: 1920,
          height: 1080,
        };
        break;
        
      default:
        // Default: just re-encode to 1080p
        steps[stepName] = {
          robot: "/video/encode",
          use: previousStep,
          preset: "iphone-high",
          ffmpeg_stack: "v6.0.0",
          width: 1920,
          height: 1080,
          resize_strategy: "fit",
        };
    }
    
    previousStep = stepName;
    stepIndex++;
  }

  // If no operations, just re-encode to 1080p max
  if (operations.length === 0) {
    steps["encode"] = {
      robot: "/video/encode",
      use: ":original",
      preset: "iphone-high",
      ffmpeg_stack: "v6.0.0",
      width: 1920,
      height: 1080,
      resize_strategy: "fit",
      video_bitrate: 2500,
    };
  }

  return steps;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authKey = Deno.env.get('TRANSLOADIT_AUTH_KEY');
    const authSecret = Deno.env.get('TRANSLOADIT_AUTH_SECRET');

    if (!authKey || !authSecret) {
      console.error('Missing Transloadit credentials');
      return new Response(
        JSON.stringify({ error: 'Transloadit credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ProcessVideoRequest = await req.json();
    console.log('Received request:', body.action, body.jobId || body.videoUrl);

    switch (body.action) {
      case 'submit': {
        if (!body.videoUrl) {
          return new Response(
            JSON.stringify({ error: 'videoUrl is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const operations = body.operations || [];
        const steps = buildSteps(operations, body.videoUrl);
        
        // Set expiry 2 hours from now
        const expires = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19) + '+00:00';
        
        const params = JSON.stringify({
          auth: {
            key: authKey,
            expires: expires,
          },
          steps: steps,
        });

        const signature = await generateSignature(params, authSecret);

        console.log('Submitting job to Transloadit...');
        
        const formData = new FormData();
        formData.append('params', params);
        formData.append('signature', signature);

        const response = await fetch('https://api2.transloadit.com/assemblies', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        console.log('Transloadit response:', result.ok, result.assembly_id);

        if (!result.ok) {
          return new Response(
            JSON.stringify({ error: result.message || 'Failed to submit job' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobId: result.assembly_id,
            status: result.ok,
            message: 'Video processing started',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        if (!body.jobId) {
          return new Response(
            JSON.stringify({ error: 'jobId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Checking status for job:', body.jobId);

        const response = await fetch(`https://api2.transloadit.com/assemblies/${body.jobId}`, {
          headers: {
            'Authorization': `Basic ${btoa(authKey + ':' + authSecret)}`,
          }
        });

        const result = await response.json();
        console.log('Status result:', result.ok, result.assembly_id);

        // Extract output URLs
        let outputUrls: string[] = [];
        if (result.ok === 'ASSEMBLY_COMPLETED' && result.results) {
          for (const stepName in result.results) {
            const stepResults = result.results[stepName];
            if (Array.isArray(stepResults)) {
              outputUrls = outputUrls.concat(stepResults.map((r: { ssl_url: string }) => r.ssl_url));
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            jobId: body.jobId,
            status: result.ok,
            progress: result.bytes_received && result.bytes_expected 
              ? Math.round((result.bytes_received / result.bytes_expected) * 100) 
              : null,
            outputUrls: outputUrls,
            error: result.error || null,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel': {
        if (!body.jobId) {
          return new Response(
            JSON.stringify({ error: 'jobId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Cancelling job:', body.jobId);

        const response = await fetch(`https://api2.transloadit.com/assemblies/${body.jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${btoa(authKey + ':' + authSecret)}`,
          }
        });

        const result = await response.json();

        return new Response(
          JSON.stringify({
            success: true,
            jobId: body.jobId,
            cancelled: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: submit, status, or cancel' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
