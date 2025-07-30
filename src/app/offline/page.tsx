export const metadata = { title: 'Pas de connexion' };

export default function OfflinePage() {
  return (
    <div>
      <h1>Pas de connexion</h1>
      <p>Les données locales restent accessibles.</p>
      <a href="/agenda">Aller à l'agenda</a>
    </div>
  );
}
