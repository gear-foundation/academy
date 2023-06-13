#!/bin/bash

# Prerequisites:
#     sudo apt install inkscape icoutils optipng

cd "$(dirname "$0")/../static/img"

# SVG to PNG
PNGLIST=''
for SIZE in 16 32 48 64 128
do
  inkscape logo/green-dot.svg --export-type=png -o favicon-${SIZE}.png --export-width=$SIZE
  optipng -o7 favicon-${SIZE}.png
  PNGLIST="$PNGLIST favicon-${SIZE}.png"
done

# PNG to ICO
icotool -o favicon.ico -c $PNGLIST

# Remove PNGs
rm -v $PNGLIST
