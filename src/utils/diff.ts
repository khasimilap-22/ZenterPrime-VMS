export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function computeLineDiff(oldText: string = '', newText: string = ''): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];

  // Simple Myers / LCS or greedy diff algorithm for readable code comparison
  const n = oldLines.length;
  const m = newLines.length;

  // Build LCS matrix
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff
  let i = n;
  let j = m;
  const rawDiff: { type: 'added' | 'removed' | 'unchanged'; text: string; oldL?: number; newL?: number }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawDiff.unshift({
        type: 'unchanged',
        text: oldLines[i - 1],
        oldL: i,
        newL: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'added',
        text: newLines[j - 1],
        newL: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'removed',
        text: oldLines[i - 1],
        oldL: i,
      });
      i--;
    }
  }

  return rawDiff.map((d) => ({
    type: d.type,
    content: d.text,
    oldLineNumber: d.oldL,
    newLineNumber: d.newL,
  }));
}
