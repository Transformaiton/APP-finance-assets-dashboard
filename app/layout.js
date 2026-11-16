import './styles.css';

export const metadata = {
  title: 'Finance & Assets Dashboard by Transformaiton.com',
  description: 'Track cash, debt, investments, and manual activity in the browser. This public copy opens with a fictional demo portfolio from Transformaiton.com.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
