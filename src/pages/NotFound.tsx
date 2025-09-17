import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Helmet>
        <title>404 | Página não encontrada</title>
        <meta name="description" content="Página não encontrada na aplicação de gestão de clínica estética." />
        <link rel="canonical" href={location.pathname} />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ops! Página não encontrada</p>
        <Link to="/" className="text-primary underline">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
