#!/bin/bash
# Usage: ./merge-phase.sh <phase-name> <file1> <file2> ...
# Produces <phase-name>_files.txt with explicit per-file start/end markers.

PHASE_NAME="$1"
shift
OUTPUT="${PHASE_NAME}_files.txt"
TOTAL=$#
INDEX=0
MISSING=""

{
  echo "#################################################################################"
  echo "# MERGED FILES FOR: $PHASE_NAME"
  echo "# Generated: $(date)"
  echo "# Files requested: $TOTAL"
  echo "#################################################################################"

  for file in "$@"; do
    INDEX=$((INDEX + 1))
    echo ""
    echo "================================================================================"
    if [ -f "$file" ]; then
      echo ">>> FILE [$INDEX/$TOTAL]: $file ($(wc -l < "$file") lines)"
      echo "================================================================================"
      echo ""
      cat "$file"
      echo ""
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
    else
      echo ">>> FILE [$INDEX/$TOTAL]: $file"
      echo "================================================================================"
      echo "[MISSING FILE]"
      echo "================================================================================"
      echo "<<< END FILE [$INDEX/$TOTAL]: $file (MISSING)"
      echo "================================================================================"
      MISSING="${MISSING}\n#   - $file"
    fi
  done

  echo ""
  echo "#################################################################################"
  echo "# SUMMARY: processed $INDEX of $TOTAL"
  if [ -n "$MISSING" ]; then
    echo "# MISSING FILES:"
    printf "$MISSING\n"
  else
    echo "# MISSING FILES: none"
  fi
  echo "#################################################################################"
} > "$OUTPUT"

echo "✅ Created $OUTPUT ($(wc -l < "$OUTPUT") lines)"
