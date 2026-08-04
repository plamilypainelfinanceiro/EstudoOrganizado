# Estudo Organizado — colocando no ar (GitHub Pages) + Firebase

## Por que deu 404

O GitHub Pages precisa de um `index.html` na raiz do que está sendo publicado.
Antes eu só tinha te mandado o componente do app e os arquivos do PWA
(manifest, ícones) — faltava o projeto em volta deles. Este pacote já vem
completo, pronto para rodar.

## 1. Estrutura do projeto

```
estudo-organizado/
├── .github/workflows/deploy.yml   ← publica automaticamente a cada push
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── icon-512-maskable.png
│       └── apple-touch-icon.png
├── src/
│   ├── main.jsx
│   └── App.jsx                    ← o app inteiro (Estudo Organizado)
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

Baixe todos esses arquivos e monte essa mesma estrutura de pastas no seu
computador (ou direto pela interface do GitHub, criando cada arquivo no
caminho indicado).

## 2. Subir para o GitHub

```bash
git init
git add .
git commit -m "Estudo Organizado"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

## 3. Ativar o GitHub Pages com deploy automático

1. No repositório → **Settings → Pages**.
2. Em "Build and deployment" → **Source: GitHub Actions**.
3. Pronto — o workflow `.github/workflows/deploy.yml` já está no projeto.
   A cada `git push` na branch `main`, o GitHub builda e publica sozinho.
4. Depois do primeiro push, acompanhe em **Actions** (aba do repo) até o
   workflow terminar (ícone verde). O link do site aparece em Settings → Pages.

> Isso leva 1–2 minutos na primeira vez. Se der erro no Actions, clique nele
> para ver o log — geralmente é versão de dependência ou path errado.

## 4. Testar localmente antes de subir (opcional, mas recomendado)

```bash
npm install
npm run dev       # abre em http://localhost:5173
npm run build     # gera a pasta dist/, igual ao que vai pro ar
npm run preview   # testa o build de produção localmente
```

## 5. Instalar como app

Depois que o site estiver no ar (HTTPS), abra o link:
- **Computador (Chrome/Edge):** ícone de instalação na barra de endereço.
- **Android/Chrome:** menu ⋮ → "Adicionar à tela inicial" / "Instalar app".
- **iPhone (Safari):** botão de compartilhar → "Adicionar à Tela de Início".

## 6. Importante: onde os dados ficam salvos

Dentro do Claude, o app salva os dados usando um recurso interno do Claude
(`window.storage`). Fora do Claude — no site publicado — isso não existe,
então o `App.jsx` já vem preparado para usar automaticamente o
`localStorage` do navegador nesse caso (dá pra ver isso no início do arquivo,
na função `useAppData`). Ou seja: **funciona sozinho, sem configurar nada**,
mas os dados ficam salvos *naquele navegador/aparelho específico* — não
sincronizam entre computador e celular ainda. Isso só passa a sincronizar de
verdade depois que você conectar o Firebase (próximo passo) e trocar esse
armazenamento local por um banco de dados real (Firestore, por exemplo).

## 7. Conectando o login ao Firebase

**Criar o projeto:**
1. [console.firebase.google.com](https://console.firebase.google.com) → "Adicionar projeto".
2. **Build → Authentication → Get started** → aba "Sign-in method" → ative
   **E-mail/senha** e **Google**.
3. Ícone de engrenagem → **Configurações do projeto** → em "Seus apps",
   clique em `</>` (Web) → registre o app → copie o `firebaseConfig`.

**No seu projeto:**
```bash
npm install firebase
```

Crie `src/firebase.js`:
```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  projectId: "COLE_AQUI",
  storageBucket: "COLE_AQUI",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

Em `src/App.jsx`, dentro do componente `LoginScreen`, os dois pontos
marcados com `// TODO` (em `handleEmailSubmit` e `handleGoogleLogin`) são
onde entram as chamadas reais:

```js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// handleEmailSubmit:
if (mode === "login") {
  await signInWithEmailAndPassword(auth, email, password);
} else {
  await createUserWithEmailAndPassword(auth, email, password);
}
onContinue();

// handleGoogleLogin:
await signInWithPopup(auth, googleProvider);
onContinue();
```

E no componente `App`, troque `useState(false)` do `authed` por:
```js
useEffect(() => {
  return onAuthStateChanged(auth, (user) => setAuthed(!!user));
}, []);
```

Por fim, em **Authentication → Settings → Authorized domains**, adicione o
domínio do GitHub Pages (ex: `seu-usuario.github.io`) para o login funcionar
em produção.

## Precisa de ajuda?

plamailypainelfinanceiro@gmail.com
