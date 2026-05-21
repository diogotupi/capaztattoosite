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
- **Domínio personalizado:** configure `capaztattoo.com` nas Settings → Pages do repositório (ficheiro `CNAME` com `capaztattoo.com`). O AR fica em **https://capaztattoo.com/ar/**

## App AR (`/ar`)

O projeto [tattooar](../tattooar) é compilado para a pasta `ar/` com base **`/ar/`** (obrigatório em `capaztattoo.com/ar`). Para atualizar:

```powershell
npm run build:ar
# ou: .\scripts\sync-ar.ps1
```

Depois faça **commit da pasta `ar/`** e `git push` — o site principal não usa `npm` na raiz para o HTML; só o passo acima regera o AR.

## Estrutura

- Início → Sobre → Portfólio → Catálogo → Agenda → Contato → **A.R** (`/ar`)
- Carrosséis contínuos no portfólio e no catálogo
