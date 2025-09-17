import { Helmet } from "react-helmet-async";

export default function Settings() {
  return (
    <>
      <Helmet>
        <title>Configurações | Gestão de Clínica Estética</title>
        <meta name="description" content="Preferências do sistema, perfis de acesso e notificações." />
        <link rel="canonical" href="/configuracoes" />
      </Helmet>
      <div className="rounded-xl border bg-card/80 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold">Configurações</h2>
        <p className="text-muted-foreground">Em breve: perfis de usuário, LGPD e integrações.</p>
      </div>
    </>
  );
}
