import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <title>文字-画像コンバータ  </title>
      </head>
      <body>{children}</body>
    </html>
  );
}
