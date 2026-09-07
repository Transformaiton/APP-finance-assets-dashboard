import './styles.css';

export const metadata = {
  title: 'My Money Dashboard',
  description: 'Personal finance balance and activity dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
