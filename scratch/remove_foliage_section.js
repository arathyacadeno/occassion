const fs = require('fs');
const filePath = 'src/components/customization/FlowerCustomizer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove DecorationOption import if present
content = content.replace(
  '  DecorationOption,\n',
  ''
).replace(
  '  DecorationOption,\r\n',
  ''
);

// 2. Remove selectedDecorations state and handler
content = content.replace(
  /const \[selectedDecorations, setSelectedDecorations\] = useState<DecorationOption\[\]>\(\[\]\);\r?\n/,
  ''
);
content = content.replace(
  /\/\/ Toggle decoration\r?\n\s*const handleToggleDecoration = \(dec: any\) => \{[\s\S]*?\};\r?\n/,
  ''
).replace(
  /\/\/ Toggle decoration\r?\n\s*const handleToggleDecoration = \(dec: DecorationOption\) => \{[\s\S]*?\};\r?\n/,
  ''
);

// 3. Update priceBreakdown
content = content.replace(
  /const priceBreakdown = useMemo\(\(\) => \{[\s\S]*?selectedDecorations\.map\(\(d\) => d\.id\),[\s\S]*?\}, \[product\.price, selectedSize, selectedDecorations, selectedVariety, flowerCategory\]\);/,
  `const priceBreakdown = useMemo(() => {
    return calculateCustomizationPrice(
      product.price,
      selectedSize.id,
      undefined,
      undefined,
      [],
      selectedVariety?.id,
      flowerCategory
    );
  }, [product.price, selectedSize, selectedVariety, flowerCategory]);`
);

// 4. Update summaryText
content = content.replace(
  /const summaryText = useMemo\(\(\) => \{[\s\S]*?if \(selectedDecorations\.length > 0\) \{[\s\S]*?\}[\s\S]*?return parts\.join\(" • "\);[\s\S]*?\}, \[selectedSize, selectedVariety, selectedDecorations, config\]\);/,
  `const summaryText = useMemo(() => {
    const parts = [
      selectedSize.name,
    ];
    if (selectedVariety && selectedVariety.name !== config.flowerOptions[0]?.name) {
      parts.unshift(selectedVariety.name);
    }
    return parts.join(" • ");
  }, [selectedSize, selectedVariety, config]);`
);

// 5. Update customPayload
content = content.replace(
  /decorations: selectedDecorations,/,
  'decorations: [],'
);
content = content.replace(
  /\}, \[product, activeImage, flowerCategory, selectedVariety, selectedSize, selectedDecorations, priceBreakdown, finalUnitPrice, customNote, summaryText\]\);/,
  '}, [product, activeImage, flowerCategory, selectedVariety, selectedSize, priceBreakdown, finalUnitPrice, customNote, summaryText]);'
);

// 6. Update stepSubtitle
content = content.replace(
  'Choose your preferred bloom varieties, scale, and botanical accents.',
  'Choose your preferred bloom varieties and bouquet scale.'
);

// 7. Remove Section C (Foliage & Botanical Accents) from JSX
const foliageStart = '{/* E. ADDITIONAL DECORATIONS & FILLERS */}';
const noteStart = '{/* F. COMPLIMENTARY GREETING NOTE */}';

const sF = content.indexOf(foliageStart);
const sN = content.indexOf(noteStart);

if (sF !== -1 && sN !== -1) {
  content = content.slice(0, sF) + content.slice(sN);
  console.log('Removed Foliage & Botanical Accents JSX block!');
} else {
  console.error('Could not find markers for foliage section:', { sF, sN });
}

// 8. Rename Gift Card Message to C.
content = content.replace(
  'F. Complimentary Gift Card Message (Optional)',
  'C. Complimentary Gift Card Message (Optional)'
);

// 9. Remove decorationCharges from breakdown table
content = content.replace(
  /\{priceBreakdown\.decorationCharges > 0 && \([\s\S]*?Additional Botanical Fillers[\s\S]*?\)\}\r?\n/,
  ''
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('FlowerCustomizer.tsx updated successfully without Foliage section!');
