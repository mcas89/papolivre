import { useState, useEffect } from "react";
import { ArrowLeft, Coins, PackageOpen, History, Info, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { STORE_PRODUCTS } from "../../constants/storeProducts";
import { PURCHASE_TYPE } from "../../constants/creditConstants";
import { useAuth } from "../../context/AuthContext";
import creditService from "../../services/creditService";
import giftService from "../../services/giftService";
import { GIFTS_CATALOG } from "../../constants/giftConstants";

import CreateRoomModal from "../../components/room/CreateRoomModal/CreateRoomModal";
import RenewRoomModal from "../../components/room/RenewRoomModal/RenewRoomModal";
import HighlightRoomModal from "../../components/room/HighlightRoomModal/HighlightRoomModal";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import "./Benefits.css";

function Benefits() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const credits = user?.credits || 0;
  const isAnonymous = !!(user?.anonymous || user?.isAnonymous);
  
  const [activeTab, setActiveTab] = useState("catalog"); // "catalog" | "wallet" | "gifts"
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [giftsList, setGiftsList] = useState([]);
  const [loadingGifts, setLoadingGifts] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isRenewRoomOpen, setIsRenewRoomOpen] = useState(false);
  const [isHighlightRoomOpen, setIsHighlightRoomOpen] = useState(false);

  async function handleRegisterClick() {
    await logout();
    navigate(ROUTES.QUICK_REGISTER);
  }

  useEffect(() => {
    if (activeTab === "wallet" && user?.uid) {
      loadHistory();
    }
    if (activeTab === "gifts" && user?.uid) {
      loadGifts();
    }
  }, [activeTab, user]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await creditService.getUserHistory(user.uid);
      setHistory(data);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadGifts() {
    setLoadingGifts(true);
    try {
      const data = await giftService.getUserGifts(user.uid);
      setGiftsList(data);
    } catch (err) {
      console.error("Erro ao carregar presentes:", err);
    } finally {
      setLoadingGifts(false);
    }
  }

  async function handleConvertGift() {
    if (isAnonymous) {
      showToast("Crie uma conta gratuita para utilizar o sistema de presentes do PapoLivre.", "info");
      return;
    }
    
    const isConfirmed = await confirm(`Deseja converter todos os seus Coins disponíveis em créditos?\n\nTaxa: 2 Coins = 1 Crédito.`);
    if (!isConfirmed) return;

    try {
      const res = await giftService.convertCoinsToCredits(user.uid);
      showToast(`Conversão realizada com sucesso!\nVocê ganhou ${res.credits} créditos e consumiu ${res.consumed} Coins.`, "success");
      loadGifts();
      // O saldo é atualizado via context pelo snapshot do usuário
    } catch (err) {
      showToast("Erro ao converter presentes: " + err.message, "error");
    }
  }

  const subscriptionProducts = STORE_PRODUCTS.filter(p => p.enabled && p.category === "SUBSCRIPTION");
  const roomProducts = STORE_PRODUCTS.filter(p => p.enabled && (p.category === "ROOM" || p.id === "highlight_room"));
  const featureProducts = STORE_PRODUCTS.filter(p => p.enabled && (p.category === "FEATURE" || p.id === "highlight_message"));
  const creditProducts = STORE_PRODUCTS.filter(p => p.enabled && p.category === "CREDIT_PACK");

  function formatDateTime(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  }

  async function handlePurchase(product) {
    if (product.purchaseType !== PURCHASE_TYPE.CREDITS) {
      if (product.category === "CREDIT_PACK") {
        const message = encodeURIComponent(`Olá, desejo comprar o pacote de ${product.price} créditos (R$ ${product.realPrice.toFixed(2).replace('.', ',')}). Meu email é: `);
        window.open(`https://t.me/Opapolivre?text=${message}`, '_blank');
      }
      return;
    }
    
    // Se for Criar Sala, abre o modal em vez de comprar direto
    if (product.id === "create_room") {
       setIsCreateRoomOpen(true);
       return;
    }

    if (product.id === "renew_room") {
       setIsRenewRoomOpen(true);
       return;
    }
    
    if (product.id === "highlight_room") {
       setIsHighlightRoomOpen(true);
       return;
    }

    // Wait, o Premium cria sala e tem Passe de efeitos grátis. Mas Passe de Efeitos é automático, Criar Sala requer ação.
    const isPremium = !!user?.isPremium;
    if (product.id === "effects_pass" && isPremium) {
       showToast("Você já possui o Passe de Efeitos incluso no seu plano PRO!", "info");
       return;
    }

    if (!isPremium && credits < product.price) {
      showToast("Você não tem créditos suficientes!", "error");
      return;
    }

    const isConfirmed = await confirm(`Deseja realmente comprar ${product.name} por ${product.price} créditos?`);
    if (!isConfirmed) return;

    setIsBuying(true);
    try {
      let additionalUpdates = {};
      const now = new Date();
      
      if (product.id === "effects_pass") {
        const days = 7;
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        additionalUpdates = { effectsPassUntil: expiresAt };
      } else if (product.id === "premium_pro") {
        const days = 7;
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        additionalUpdates = { isPremium: true, premiumUntil: expiresAt };
      }
      
      await creditService.removeCredits(
        user.uid,
        product.price,
        `Compra: ${product.name}`,
        "STORE_PURCHASE",
        additionalUpdates
      );
      
      showToast(`Compra de ${product.name} realizada com sucesso!`, "success");
      if (activeTab === "wallet") loadHistory();
    } catch (err) {
      showToast("Erro ao realizar compra: " + err.message, "error");
    } finally {
      setIsBuying(false);
    }
  }

  const isPremium = !!user?.isPremium;

  function renderProductCard(product) {
    const isCreditPurchase = product.purchaseType === PURCHASE_TYPE.CREDITS;
    const canAfford = isCreditPurchase && credits >= product.price;

    let isDisabled = isCreditPurchase ? (!canAfford || isBuying) : false;
    let buttonContent = isCreditPurchase ? (
      <>
        {product.price} <Coins size={14} style={{ display: "inline", verticalAlign: "middle" }} />
      </>
    ) : (
      <>R$ {product.realPrice?.toFixed(2).replace('.', ',') || "0,00"}</>
    );

    if (isPremium) {
      if (product.id === "effects_pass") {
        isDisabled = true;
        buttonContent = "Incluso no PRO";
      } else if (product.id === "create_room") {
        isDisabled = false;
        buttonContent = "Criar Sala (GRÁTIS)";
      } else if (product.id === "renew_room") {
        isDisabled = false;
        buttonContent = "Renovar (GRÁTIS)";
      } else if (product.id === "premium_pro") {
        buttonContent = (
          <>
            Renovar ({product.price} <Coins size={14} style={{ display: "inline", verticalAlign: "middle" }} />)
          </>
        );
      }
    } else {
      const hasPass = user?.effectsPassUntil && user?.effectsPassUntil?.toMillis && (user.effectsPassUntil.toMillis() > Date.now());
      if (hasPass && product.id === "effects_pass") {
        buttonContent = (
          <>
            Renovar ({product.price} <Coins size={14} style={{ display: "inline", verticalAlign: "middle" }} />)
          </>
        );
      }
    }

    const buttonStyle = (!isDisabled && isCreditPurchase) 
      ? { cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 'bold' } 
      : (!isDisabled && !isCreditPurchase) 
      ? { cursor: 'pointer', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 'bold' } 
      : {};

    return (
      <div key={product.id} className="benefit-card">
        <div className="benefit-info">
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <div className="benefit-action">
          <button 
            className="benefit-buy-btn" 
            disabled={isDisabled}
            onClick={() => !isDisabled && handlePurchase(product)}
            style={buttonStyle}
          >
            {buttonContent}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="benefits-page">
      {/* Background Particles */}
      <div className="benefits-bg">
        {[...Array(10)].map((_, i) => (
          <span key={i} className={`bubble bubble-${i + 1}`} />
        ))}
      </div>

      <header className="benefits-header">
        <button className="benefits-back-btn" onClick={() => navigate(ROUTES.HOME)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="benefits-header-title">✨ Benefícios</h1>
      </header>

      {isAnonymous ? (
        <div className="benefits-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <div className="premium-sales-area" style={{ padding: '32px 20px', maxWidth: '320px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff' }}>Área VIP</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Apenas usuários com conta podem assinar o Premium PRO. Crie uma conta gratuita.
            </p>
            <button className="benefit-buy-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 'bold' }} onClick={handleRegisterClick}>
              Criar Conta Grátis
            </button>
          </div>
        </div>
      ) : (
        <div className="benefits-content">
        
        {/* Cartão Superior: Saldo */}
        <div className="benefits-balance-card">
          <div className="balance-info">
            <h2>Seu Saldo</h2>
            <div className="balance-amount">
              <Coins size={28} className="balance-icon" />
              <span>{credits}</span>
            </div>
          </div>
          <div className="balance-desc">
            <Info size={16} />
            <p>Os Créditos do PapoLivre permitem adquirir vantagens exclusivas, como Premium Pro, destaque de mensagens e outras funcionalidades especiais que estão por vir!</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="benefits-tabs">
          <button 
            className={`tab-btn ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            <PackageOpen size={18} />
            Catálogo
          </button>
          <button 
            className={`tab-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <History size={18} />
            Carteira
          </button>
          <button 
            className={`tab-btn ${activeTab === "gifts" ? "active" : ""}`}
            onClick={() => {
              if (isAnonymous) {
                showToast("Crie uma conta gratuita para utilizar o sistema de presentes do PapoLivre.", "info");
                return;
              }
              setActiveTab("gifts");
            }}
          >
            <Gift size={18} />
            Presentes
          </button>
        </div>

        {/* Aba: Catálogo */}
        {activeTab === "catalog" && (
          <div className="tab-content catalog-content">
            {/* Categoria: Assinaturas */}
            {subscriptionProducts.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: '0' }}>Assinaturas</h2>
                <div className="benefits-list">
                  {subscriptionProducts.map(renderProductCard)}
                </div>
              </>
            )}

            {/* Categoria: Salas */}
            {roomProducts.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: '24px' }}>Salas</h2>
                <div className="benefits-list">
                  {roomProducts.map(renderProductCard)}
                </div>
              </>
            )}

            {/* Categoria: Personalização */}
            {featureProducts.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: '24px' }}>Personalização</h2>
                <div className="benefits-list">
                  {featureProducts.map(renderProductCard)}
                </div>
              </>
            )}

            <div className="coming-soon-divider">
              <span>Comprar Créditos</span>
            </div>

            {/* Categoria: Comprar Créditos */}
            {creditProducts.length > 0 && (
              <div className="benefits-list">
                {creditProducts.map(renderProductCard)}
              </div>
            )}
          </div>
        )}

        {/* Aba: Carteira (Histórico) */}
        {activeTab === "wallet" && (
          <div className="tab-content wallet-content">
            <h2 className="section-title">Histórico de Transações</h2>
            
            {loadingHistory ? (
              <p className="wallet-empty">Carregando histórico...</p>
            ) : history.length === 0 ? (
              <p className="wallet-empty">Você ainda não possui movimentações na carteira.</p>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-icon-wrapper">
                      {item.type === "IN" ? (
                        <div className="hist-icon in"><Coins size={16}/></div>
                      ) : (
                        <div className="hist-icon out"><PackageOpen size={16}/></div>
                      )}
                    </div>
                    <div className="history-details">
                      <span className="hist-reason">{item.reason}</span>
                      <span className="hist-date">{formatDateTime(item.timestamp)}</span>
                    </div>
                    <div className="history-amounts">
                      <span className={`hist-value ${item.type === "IN" ? "val-in" : "val-out"}`}>
                        {item.type === "IN" ? "+" : "-"}{item.amount}
                      </span>
                      <span className="hist-balance">Saldo final: {item.balanceAfter}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba: Presentes Recebidos */}
        {activeTab === "gifts" && (
          <div className="tab-content gifts-content">
            <h2 className="section-title">Meus Presentes</h2>
            
            {loadingGifts ? (
              <p className="wallet-empty">Carregando presentes...</p>
            ) : (
              <>
                {(() => {
                  const totalEarnedCoins = giftsList.reduce((sum, g) => {
                    const giftDef = GIFTS_CATALOG.find(cat => cat.id === g.giftType);
                    const val = giftDef ? giftDef.coinValue : 0;
                    return sum + val;
                  }, 0);
                  const convertedCoins = user?.convertedGiftCoins || 0;
                  const availableCoins = Math.max(0, totalEarnedCoins - convertedCoins);
                  const creditsToGet = Math.floor(availableCoins / 2);

                  return (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ color: '#fcd34d', margin: '0 0 4px 0' }}>Saldo de Presentes: {availableCoins} Coins</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                          Taxa de conversão: 2 Coins = 1 Crédito
                        </p>
                      </div>
                      <button 
                        onClick={handleConvertGift}
                        disabled={availableCoins < 2}
                        style={{
                          background: availableCoins < 2 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: availableCoins < 2 ? 'rgba(255,255,255,0.3)' : '#000',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          cursor: availableCoins < 2 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Converter ({creditsToGet} Créditos)
                      </button>
                    </div>
                  );
                })()}

                <div className="benefits-list">
                  {GIFTS_CATALOG.map((giftDef) => {
                    const giftsOfType = giftsList.filter(g => g.giftType === giftDef.id);
                    if (giftsOfType.length === 0) return null;
                    
                    return (
                      <div key={giftDef.id} className="benefit-card" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="benefit-info">
                          <h3 style={{ margin: 0 }}>
                            {giftDef.icon} {giftDef.name}
                          </h3>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fcd34d', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px' }}>
                          x{giftsOfType.length}
                        </div>
                      </div>
                    );
                  })}
                  {giftsList.length === 0 && (
                     <p className="wallet-empty" style={{ width: '100%', textAlign: 'center' }}>Você ainda não recebeu nenhum presente.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}


        </div>
      )}

      <CreateRoomModal 
        isOpen={isCreateRoomOpen} 
        onClose={() => setIsCreateRoomOpen(false)} 
        onSuccess={() => {
           // Opcional: Navegar para a Home ou mostrar mensagem
        }} 
      />

      <RenewRoomModal 
        isOpen={isRenewRoomOpen}
        onClose={() => setIsRenewRoomOpen(false)}
      />

      <HighlightRoomModal 
        isOpen={isHighlightRoomOpen}
        onClose={() => setIsHighlightRoomOpen(false)}
        onSuccess={() => showToast("Sala destacada com sucesso! Ela ficará no topo por 24 horas.", "success")}
      />
    </main>
  );
}

export default Benefits;
