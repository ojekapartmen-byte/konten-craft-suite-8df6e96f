// Text preprocessing utilities for Voice Over
// Converts numbers, currency, dates, and abbreviations to spoken Indonesian

type PreprocessingMode = 'natural' | 'angka' | 'campuran';

// Indonesian number words
const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const BELASAN = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
const PULUHAN = ['', 'sepuluh', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Common abbreviations
const ABBREVIATIONS: Record<string, string> = {
  'WEF': 'W E F',
  'IMF': 'I M F',
  'WHO': 'W H O',
  'UN': 'U N',
  'PBB': 'P B B',
  'RI': 'R I',
  'DPR': 'D P R',
  'MPR': 'M P R',
  'KPK': 'K P K',
  'OJK': 'O J K',
  'BI': 'B I',
  'BPS': 'B P S',
  'BUMN': 'B U M N',
  'UMK': 'U M K',
  'UMKM': 'U M K M',
  'PHK': 'P H K',
  'TKI': 'T K I',
  'PMI': 'P M I',
  'ASN': 'A S N',
  'PNS': 'P N S',
  'TNI': 'T N I',
  'POLRI': 'P O L R I',
  'DKI': 'D K I',
  'DIY': 'D I Y',
  'NTT': 'N T T',
  'NTB': 'N T B',
  'PSBB': 'P S B B',
  'PPKM': 'P P K M',
  'COVID': 'covid',
  'AI': 'A I',
  'IT': 'I T',
  'CEO': 'C E O',
  'CFO': 'C F O',
  'HR': 'H R',
  'PR': 'P R',
  'CV': 'C V',
  'PT': 'P T',
  'Tbk': 'terbuka',
  'dll': 'dan lain-lain',
  'dsb': 'dan sebagainya',
  'dkk': 'dan kawan-kawan',
  'yg': 'yang',
  'dgn': 'dengan',
  'utk': 'untuk',
  'tdk': 'tidak',
  'sdh': 'sudah',
  'blm': 'belum',
  'krn': 'karena',
  'shg': 'sehingga',
};

// Convert number to Indonesian words
function numberToWords(num: number): string {
  if (num === 0) return 'nol';
  if (num < 0) return 'minus ' + numberToWords(Math.abs(num));
  
  if (num < 10) return SATUAN[num];
  if (num < 20) return BELASAN[num - 10];
  if (num < 100) {
    const puluh = Math.floor(num / 10);
    const satu = num % 10;
    return PULUHAN[puluh] + (satu ? ' ' + SATUAN[satu] : '');
  }
  if (num < 200) return 'seratus' + (num > 100 ? ' ' + numberToWords(num - 100) : '');
  if (num < 1000) {
    const ratus = Math.floor(num / 100);
    const sisa = num % 100;
    return SATUAN[ratus] + ' ratus' + (sisa ? ' ' + numberToWords(sisa) : '');
  }
  if (num < 2000) return 'seribu' + (num > 1000 ? ' ' + numberToWords(num - 1000) : '');
  if (num < 1000000) {
    const ribu = Math.floor(num / 1000);
    const sisa = num % 1000;
    return numberToWords(ribu) + ' ribu' + (sisa ? ' ' + numberToWords(sisa) : '');
  }
  if (num < 1000000000) {
    const juta = Math.floor(num / 1000000);
    const sisa = num % 1000000;
    return numberToWords(juta) + ' juta' + (sisa ? ' ' + numberToWords(sisa) : '');
  }
  if (num < 1000000000000) {
    const miliar = Math.floor(num / 1000000000);
    const sisa = num % 1000000000;
    return numberToWords(miliar) + ' miliar' + (sisa ? ' ' + numberToWords(sisa) : '');
  }
  const triliun = Math.floor(num / 1000000000000);
  const sisa = num % 1000000000000;
  return numberToWords(triliun) + ' triliun' + (sisa ? ' ' + numberToWords(sisa) : '');
}

// Convert decimal number to words
function decimalToWords(numStr: string): string {
  const parts = numStr.replace(',', '.').split('.');
  const intPart = parseInt(parts[0].replace(/\./g, ''), 10);
  
  if (parts.length === 1 || !parts[1]) {
    return numberToWords(intPart);
  }
  
  // Handle decimal part
  const decPart = parts[1];
  const decWords = decPart.split('').map(d => SATUAN[parseInt(d, 10)] || 'nol').join(' ');
  
  return numberToWords(intPart) + ' koma ' + decWords;
}

// Parse and convert currency
function convertCurrency(text: string): string {
  // Rp 3,8 triliun -> tiga koma delapan triliun rupiah
  const patterns = [
    // Rp X,X triliun/miliar/juta/ribu
    /Rp\s*([\d.,]+)\s*(triliun|miliar|juta|ribu|rb)/gi,
    // Rp XX.XXX.XXX
    /Rp\s*([\d.]+)/gi,
    // IDR patterns
    /IDR\s*([\d.,]+)\s*(triliun|miliar|juta|ribu|rb)?/gi,
    // $ patterns
    /\$\s*([\d.,]+)\s*(trillion|billion|million|thousand)?/gi,
    /USD\s*([\d.,]+)/gi,
  ];
  
  let result = text;
  
  // Handle \"Rp X,X triliun/miliar/juta\"
  result = result.replace(/Rp\s*([\d]+)[,.](\d+)\s*(triliun|miliar|juta|ribu)/gi, (_, int, dec, unit) => {
    const unitMap: Record<string, string> = {
      'triliun': 'triliun',
      'miliar': 'miliar', 
      'juta': 'juta',
      'ribu': 'ribu',
    };
    return `${numberToWords(parseInt(int, 10))} koma ${dec.split('').map((d: string) => SATUAN[parseInt(d, 10)] || 'nol').join(' ')} ${unitMap[unit.toLowerCase()]} rupiah`;
  });
  
  // Handle plain Rp XX.XXX.XXX
  result = result.replace(/Rp\s*([\d.]+)(?!\s*(triliun|miliar|juta|ribu|koma))/gi, (_, numStr) => {
    const num = parseInt(numStr.replace(/\./g, ''), 10);
    if (isNaN(num)) return _;
    return numberToWords(num) + ' rupiah';
  });
  
  // Handle USD/Dollar
  result = result.replace(/\$\s*([\d.,]+)(?:\s*(trillion|billion|million|thousand))?/gi, (_, numStr, unit) => {
    const num = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(num)) return _;
    const unitMap: Record<string, string> = {
      'trillion': 'triliun',
      'billion': 'miliar',
      'million': 'juta',
      'thousand': 'ribu',
    };
    const unitWord = unit ? ' ' + unitMap[unit.toLowerCase()] : '';
    return decimalToWords(numStr) + unitWord + ' dolar';
  });
  
  return result;
}

// Convert dates
function convertDates(text: string): string {
  let result = text;
  
  // DD/MM/YYYY or DD-MM-YYYY
  result = result.replace(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g, (_, d, m, y) => {
    const day = parseInt(d, 10);
    const month = parseInt(m, 10) - 1;
    const year = parseInt(y, 10);
    if (month < 0 || month > 11) return _;
    return `${numberToWords(day)} ${MONTHS[month]} ${numberToWords(year)}`;
  });
  
  // DD Month YYYY (e.g., 22 Januari 2026)
  result = result.replace(/(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/gi, (_, d, m, y) => {
    const day = parseInt(d, 10);
    const year = parseInt(y, 10);
    return `${numberToWords(day)} ${m} ${numberToWords(year)}`;
  });
  
  return result;
}

// Convert standalone numbers
function convertNumbers(text: string, mode: PreprocessingMode): string {
  if (mode === 'angka') {
    // Keep numbers as-is, just add spaces for readability
    return text.replace(/(\d+)/g, (match) => {
      if (match.length > 4) {
        return match.split('').join(' ');
      }
      return match;
    });
  }
  
  // Natural mode: convert all numbers to words
  return text.replace(/(\d+[.,]?\d*)/g, (match) => {
    // Skip if already processed (part of currency/date)
    if (match.includes('.') && match.split('.').length > 2) {
      // This is a formatted number like 17.000
      const num = parseInt(match.replace(/\./g, ''), 10);
      if (!isNaN(num)) return numberToWords(num);
    }
    if (match.includes(',')) {
      return decimalToWords(match);
    }
    const num = parseInt(match, 10);
    if (!isNaN(num)) return numberToWords(num);
    return match;
  });
}

// Convert abbreviations
function convertAbbreviations(text: string): string {
  let result = text;
  
  // Sort by length (longer first) to avoid partial replacements
  const sortedAbbrevs = Object.entries(ABBREVIATIONS).sort((a, b) => b[0].length - a[0].length);
  
  for (const [abbrev, expansion] of sortedAbbrevs) {
    // Word boundary matching
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    result = result.replace(regex, expansion);
  }
  
  return result;
}

// Clean up text for voice
function cleanupText(text: string): string {
  return text
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove special characters that don't translate to speech
    .replace(/[•●○◦▪▫]/g, '')
    // Convert bullet points to pause
    .replace(/^\s*[-*]\s*/gm, '. ')
    // Ensure sentences end with proper punctuation
    .replace(/([^.!?])\s*\n/g, '$1. ')
    // Clean up
    .trim();
}

// Main preprocessing function
export function preprocessTextForVoice(text: string, mode: PreprocessingMode = 'natural'): string {
  let result = text;
  
  // Step 1: Clean up the text
  result = cleanupText(result);
  
  // Step 2: Convert abbreviations
  result = convertAbbreviations(result);
  
  // Step 3: Convert currency (before general numbers)
  result = convertCurrency(result);
  
  // Step 4: Convert dates (before general numbers)
  result = convertDates(result);
  
  // Step 5: Convert remaining numbers based on mode
  if (mode !== 'angka') {
    result = convertNumbers(result, mode);
  }
  
  // Final cleanup
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

// Split text into segments for batch processing
export function splitIntoSegments(text: string, maxChars: number = 500): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const segments: string[] = [];
  let currentSegment = '';
  
  for (const sentence of sentences) {
    if (currentSegment.length + sentence.length > maxChars && currentSegment) {
      segments.push(currentSegment.trim());
      currentSegment = sentence;
    } else {
      currentSegment += (currentSegment ? ' ' : '') + sentence;
    }
  }
  
  if (currentSegment.trim()) {
    segments.push(currentSegment.trim());
  }
  
  return segments.length > 0 ? segments : [text];
}

// Get changes preview
export function getPreprocessingChanges(original: string, processed: string): { original: string; processed: string }[] {
  const changes: { original: string; processed: string }[] = [];
  
  // Find numeric changes
  const numPattern = /Rp\s*[\d.,]+\s*(?:triliun|miliar|juta|ribu)?|\$[\d.,]+|\d+[.,]?\d*|\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b|\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4}\b/gi;
  
  const originalMatches = original.match(numPattern) || [];
  
  for (const match of originalMatches) {
    const processedVersion = preprocessTextForVoice(match, 'natural');
    if (match !== processedVersion) {
      changes.push({ original: match, processed: processedVersion });
    }
  }
  
  // Find abbreviation changes
  for (const [abbrev, expansion] of Object.entries(ABBREVIATIONS)) {
    if (original.includes(abbrev) && !processed.includes(abbrev)) {
      changes.push({ original: abbrev, processed: expansion });
    }
  }
  
  return changes;
}
