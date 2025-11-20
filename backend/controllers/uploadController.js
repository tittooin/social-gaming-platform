import path from 'path';

export function handleFileUpload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const relPath = `/uploads/${req.file.filename}`;
  res.json({ url: relPath, filename: req.file.filename });
}