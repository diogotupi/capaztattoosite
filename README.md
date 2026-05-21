# Capaz Tattoo — Site

Site estático em preto e branco para **Capaz Tattoo** (Camila Paz), com idiomas **PT** (padrão), **EN** e **ES**.

## Ver localmente

```bash
npx serve .
```

## Personalizar

1. **Imagens** — `assets/portfolio/`, `assets/catalogo/`, `assets/about.jpg`
2. **WhatsApp e Instagram** — Atualize os links em `index.html` (`#whatsappLink`, `#instagramLink`, `#whatsappContact`)
3. **Logo** — `assets/logo.png` no header (opcional)

## Deploy

- **GitHub Pages:** https://github.com/diogotupi/capaztattoosite
- **Domínio:** use sempre **https://www.capaztattoo.com** (ficheiro `CNAME` = `www.capaztattoo.com`). O AR fica em **https://www.capaztattoo.com/ar/**
- **Não confundir** com [diogotupi.github.io/tattooar](https://diogotupi.github.io/tattooar/) — é outro deploy (base `/tattooar/`), no repo [tattooar](../tattooar).

### Por que o AR pode falhar em capaztattoo.com

1. **URL sem `www`** — `capaztattoo.com` pode não apontar para o GitHub Pages; o site redireciona para `www`.
2. **HTTPS** — a câmara AR só funciona em contexto seguro. No GitHub Pages, confirme o certificado em Settings → Pages (estado “Certificate issued”).
3. **Build errado** — o embed em `/ar` precisa de `VITE_BASE_PATH=/ar/`. O deploy do repo tattooar usa `/tattooar/` (`npm run deploy` → `build:pages`).

## App AR (`/ar`)

O projeto [tattooar](../tattooar) é compilado para a pasta `ar/` com base **`/ar/`** (`.env.production`). Para atualizar:

```powershell
npm run build:ar
# ou: .\scripts\sync-ar.ps1
```

Depois faça **commit da pasta `ar/`** e `git push` — o site principal não usa `npm` na raiz para o HTML; só o passo acima regera o AR.

## Estrutura

- Início → Sobre → Portfólio → Catálogo → Agenda → Contato → **A.R** (`/ar`)
- Carrosséis contínuos no portfólio e no catálogo
