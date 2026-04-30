#!/bin/bash
for file in $(find src/pages -name "*.astro"); do
  if ! grep -q "ViewTransitions" "$file"; then
    # Add import right after the first ---
    sed -i '' 's/---/---\'$'\n''import { ViewTransitions } from "astro:transitions";/1' "$file"
    
    # Add <ViewTransitions /> right before </head>
    sed -i '' 's/<\/head>/  <ViewTransitions \/>\'$'\n''<\/head>/' "$file"
  fi
done
