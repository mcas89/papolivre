import "./Privacy.css";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const sections = [
  {
    title: "1. Dados que coletamos",
    text: `Coletamos apenas o mínimo necessário para que o PapoLivre funcione: apelido, avatar, cidade e, opcionalmente, localização geográfica aproximada (para a sala "Pessoas Próximas"). Não pedimos nome completo, CPF, telefone nem qualquer outro dado sensível.`,
  },
  {
    title: "2. Como usamos seus dados",
    text: `Seus dados são utilizados exclusivamente para identificá-lo dentro do bate-papo, exibir seu perfil para outros usuários na mesma sala e permitir que o sistema de presença funcione corretamente. Não vendemos, compartilhamos nem utilizamos seus dados para fins de publicidade.`,
  },
  {
    title: "3. Armazenamento",
    text: `Os dados são armazenados de forma segura no Firebase (Google Cloud), com criptografia em trânsito e em repouso. Perfis de usuários anônimos que ficam inativos por mais de 24 horas são automaticamente excluídos.`,
  },
  {
    title: "4. Mensagens e histórico",
    text: `As mensagens enviadas nas salas são públicas para os usuários presentes nela. O histórico é limitado às últimas 100 mensagens por sala, e ao entrar em uma sala você visualiza apenas as 5 mensagens mais recentes. Não armazenamos conversas privadas de forma permanente.`,
  },
  {
    title: "5. Localização",
    text: `A localização geográfica é utilizada apenas para conectar você a outros usuários próximos na sala "Pessoas Próximas". Usamos coordenadas aproximadas (arredondadas por quadrante) e não rastreamos sua posição em tempo real fora dessa funcionalidade. A coleta é sempre mediante sua permissão explícita.`,
  },
  {
    title: "6. Cookies e sessão",
    text: `Utilizamos o sistema de autenticação do Firebase, que armazena um token de sessão no seu navegador para mantê-lo conectado. Não utilizamos cookies de rastreamento ou analytics de terceiros.`,
  },
  {
    title: "7. Seus direitos",
    text: `Você pode excluir seu perfil a qualquer momento simplesmente desconectando e não retornando — perfis anônimos são removidos automaticamente. Para usuários cadastrados, entre em contato via Telegram para solicitar a exclusão completa dos seus dados.`,
  },
  {
    title: "8. Contato",
    text: `Dúvidas sobre esta política? Fale conosco pelo Telegram. Estamos disponíveis para esclarecer qualquer questão sobre privacidade e uso de dados.`,
  },
];

function Privacy() {
  const navigate = useNavigate();

  return (
    <main className="legal-page">
      <header className="legal-header">
        <button className="legal-back-btn" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft size={20} />
        </button>
        <div className="legal-header-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1>Política de Privacidade</h1>
          <span>Atualizado em junho de 2025</span>
        </div>
      </header>

      <div className="legal-content">
        <p className="legal-intro">
          O <strong>PapoLivre</strong> foi construído com um princípio simples: você deve poder conversar livremente sem abrir mão da sua privacidade. Esta política explica de forma clara e direta o que fazemos com seus dados.
        </p>

        <div className="legal-sections">
          {sections.map((s, i) => (
            <div key={i} className="legal-section">
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="legal-footer-note">
          Esta política pode ser atualizada sem aviso prévio. Recomendamos revisitá-la periodicamente.
        </div>
      </div>
    </main>
  );
}

export default Privacy;
