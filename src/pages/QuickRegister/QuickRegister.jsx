import "./QuickRegister.css";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";

// =============================================================
// HELPERS DE DATA
// =============================================================

/** Retorna a data máxima permitida no calendário: hoje − 18 anos */
function getMaxBirthdate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

/** Calcula a idade exata a partir de uma string "YYYY-MM-DD" */
function calculateAge(birthdateStr) {
  const today = new Date();
  const birth = new Date(birthdateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

import logo from "../../assets/logo/logo.png";

import Card   from "../../components/ui/Card/Card";
import Button from "../../components/ui/Button/Button";
import Input  from "../../components/ui/Input/Input";

import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { requestApproximateLocation } from "../../utils/location";

// =============================================================
// VALIDAÇÕES
// =============================================================

function validate(form) {

  const errors = {};

  if (!form.name.trim())
    errors.name = "Nome é obrigatório.";

  if (!form.nickname.trim())
    errors.nickname = "Apelido é obrigatório.";

  if (!form.email.trim())
    errors.email = "Email é obrigatório.";
  else if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Email inválido.";

  if (!form.password)
    errors.password = "Senha é obrigatória.";
  else if (form.password.length < 6)
    errors.password = "Senha deve ter ao menos 6 caracteres.";

  if (!form.confirm)
    errors.confirm = "Confirme sua senha.";
  else if (form.confirm !== form.password)
    errors.confirm = "As senhas não coincidem.";

  if (!form.gender || form.gender === "")
    errors.gender = "Selecione o sexo.";

  if (!form.city.trim())
    errors.city = "Cidade é obrigatória.";

  if (!form.birthdate)
    errors.birthdate = "Data de nascimento é obrigatória.";
  else if (calculateAge(form.birthdate) < 18)
    errors.birthdate = "Você precisa ter 18 anos ou mais para se cadastrar.";

  return errors;

}

// =============================================================
// COMPONENTE
// =============================================================

function QuickRegister() {

  const navigate  = useNavigate();
  const { register } = useAuth();

  // ─── Estado do formulário ─────────────────────────────────
  const [form, setForm] = useState({
    name:      "",
    nickname:  "",
    email:     "",
    password:  "",
    confirm:   "",
    gender:    "",
    city:      "",
    birthdate: "",
  });

  // ─── Estados de UI ────────────────────────────────────────
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Handler genérico de campo ────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpa o erro do campo conforme o usuário digita
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // ─── Submit ───────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      let location = null;
      try {
        location = await requestApproximateLocation();
      } catch (err) {
        console.warn("Localização não obtida no registro:", err);
      }

      await register({
        name:      form.name,
        nickname:  form.nickname,
        email:     form.email,
        password:  form.password,
        gender:    form.gender,
        city:      form.city,
        birthdate: form.birthdate,
        age:       calculateAge(form.birthdate),
        location,
      });

      navigate(ROUTES.HOME);

    } catch (err) {

      const msg = err?.code === "auth/email-already-in-use"
        ? "Este e-mail já está cadastrado."
        : err?.code === "auth/weak-password"
        ? "Senha muito fraca. Use ao menos 6 caracteres."
        : err?.message || "Erro ao criar conta. Tente novamente.";

      setServerError(msg);

    } finally {

      setLoading(false);

    }

  }

  // =============================================================
  // RENDER
  // =============================================================

  return (

    <main className="register">

      <Card className="register-card">

        {/* HEADER */}
        <div className="register-header">
          <img src={logo} className="register-logo" alt="PapoLivre" />
          <h1>Criar conta</h1>
          <p>Leva menos de 1 minuto para começar.</p>
        </div>

        {/* ERRO GLOBAL (servidor / Firebase) */}
        {serverError && (
          <div className="register-error-global">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form className="register-form" onSubmit={handleSubmit} noValidate>

          {/* Nome completo */}
          <div className={`input-group ${errors.name ? "has-error" : ""}`}>
            <User size={18} />
            <Input
              name="name"
              placeholder="Nome completo"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}

          {/* Apelido */}
          <div className={`input-group ${errors.nickname ? "has-error" : ""}`}>
            <Users size={18} />
            <Input
              name="nickname"
              placeholder="Apelido (como aparecer no chat)"
              value={form.nickname}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
          {errors.nickname && <span className="field-error">{errors.nickname}</span>}

          {/* Email */}
          <div className={`input-group ${errors.email ? "has-error" : ""}`}>
            <Mail size={18} />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}

          {/* Senha */}
          <div className={`input-group ${errors.password ? "has-error" : ""}`}>
            <Lock size={18} />
            <Input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Senha (mínimo 6 caracteres)"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}

          {/* Confirmar senha */}
          <div className={`input-group ${errors.confirm ? "has-error" : ""}`}>
            <Lock size={18} />
            <Input
              name="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar senha"
              value={form.confirm}
              onChange={handleChange}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}

          {/* Sexo */}
          <div className={`input-group ${errors.gender ? "has-error" : ""}`}>
            <Users size={18} />
            <select
              name="gender"
              className="register-select"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Sexo</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
              <option value="prefer_not">Prefiro não informar</option>
            </select>
          </div>
          {errors.gender && <span className="field-error">{errors.gender}</span>}

          {/* Cidade */}
          <div className={`input-group ${errors.city ? "has-error" : ""}`}>
            <MapPin size={18} />
            <Input
              name="city"
              placeholder="Cidade"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          {errors.city && <span className="field-error">{errors.city}</span>}

          {/* Data de Nascimento */}
          <div className={`input-group ${errors.birthdate ? "has-error" : ""}`}>
            <Calendar size={18} />
            <Input
              name="birthdate"
              type="date"
              value={form.birthdate}
              onChange={handleChange}
              max={getMaxBirthdate()}
            />
          </div>
          {errors.birthdate && <span className="field-error">{errors.birthdate}</span>}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            full
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Criando conta...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>

        </form>

        {/* FOOTER */}
        <div className="register-footer">
          <span>Já possui uma conta?</span>{" "}
          <Link to={ROUTES.LOGIN} className="login-link">
            Entrar
          </Link>
        </div>

      </Card>

    </main>

  );

}

export default QuickRegister;