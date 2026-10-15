# Deploy na Hostnet (FTP) — LZL Services

O site é editado no Lovable e publicado automaticamente na Hostnet:

```
Lovable → GitHub (branch main) → GitHub Actions → build estático → FTP → /lzlservices/ na Hostnet
```

Cada alteração guardada no Lovable (ou `git push` para `main`) dispara o workflow
`.github/workflows/deploy-hostnet.yml`, que gera o site e envia-o por FTP.
A versão do Lovable (`npm run build`) continua igual; o build da Hostnet é separado.

## 1. Configurar o GitHub (uma vez)

No repositório: **Settings → Secrets and variables → Actions**.

**Secrets** (obrigatórios):

| Secret         | Valor                                  |
| -------------- | -------------------------------------- |
| `FTP_SERVER`   | Servidor FTP da Hostnet (ex.: `ftp.seudominio.be`) |
| `FTP_USERNAME` | Utilizador FTP da Hostnet              |
| `FTP_PASSWORD` | Palavra-passe FTP da Hostnet           |

**Variables** (opcionais):

| Variable          | Para que serve                                              | Padrão          |
| ----------------- | ----------------------------------------------------------- | --------------- |
| `SITE_URL`        | Endereço público, ex.: `https://www.lzlservices.be` — usado no Google (canonical), `sitemap.xml` e `robots.txt` | endereço do Lovable |
| `FTP_SERVER_DIR`  | Pasta no servidor                                           | `/lzlservices/` |
| `FTP_PROTOCOL`    | `ftp`, `ftps` ou `ftps-legacy`                              | `ftp`           |
| `N8N_WEBHOOK_URL` | Webhook n8n (https) que também recebe os pedidos dos formulários | —          |

Depois, em **Actions → Deploy Hostnet (FTP) → Run workflow**, faça o primeiro deploy.

## 2. Configurar a Hostnet (uma vez)

- O domínio da LZL tem de usar a pasta **`/lzlservices/`** como raiz do site
  (domínio adicional/alias apontado para essa pasta). Uma pasta ao lado de `/www/`
  não fica visível no navegador só por existir.
- O `.htaccess` precisa de `mod_rewrite` ativo (o site é uma SPA: todas as URLs
  internas, como `/nl/contact`, são servidas pelo `index.html`).
- Depois de ativar o SSL (HTTPS), descomente as 3 linhas "Force HTTPS" em
  `vite.static.config.ts` para redirecionar `http://` → `https://`.

## 3. O que é enviado

```
dist/
├── index.html      ← página da aplicação (obrigatória na raiz de /lzlservices/)
├── .htaccess       ← fallback da SPA + cache (ficheiro oculto)
├── assets/         ← JS e CSS
├── __l5e/          ← logótipo e vídeo carregados no Lovable
├── favicon.png
├── robots.txt
└── sitemap.xml
```

Para gerar localmente (Node 20+ ou Bun): `npm install` e `npm run build:static`.

## Formulários na Hostnet

A Hostnet não corre o servidor do Lovable, por isso no site da Hostnet os formulários
(orçamento, contacto e candidatura) **abrem o WhatsApp** com a mensagem preenchida
para o número da LZL. O visitante só tem de carregar em Enviar. Se `N8N_WEBHOOK_URL`
estiver definido, cada pedido é também enviado para o n8n.
No site do Lovable os formulários continuam a gravar na base de dados.

## Logótipo e vídeo

Os ficheiros carregados no Lovable (`src/assets/*.asset.json`) são descarregados do site
publicado no Lovable durante o build. Se aparecer o aviso
`lzl-logo.png not copied` nos logs do Actions, carregue o ficheiro para `public/`
com o mesmo nome (`public/lzl-logo.png`, `public/lzl-hero.mp4`) e o build passa a usá-lo.

## Problemas comuns

**403 Forbidden** — o `index.html` não está diretamente em `/lzlservices/`, ou o domínio
não aponta para essa pasta. Confirme também que o `.htaccess` foi enviado (ative
"mostrar ficheiros ocultos" no cliente FTP).

**404 ao atualizar uma página interna** — falta o `.htaccess` ou o `mod_rewrite` está desativado.

**O workflow falha em "Upload to Hostnet"** — verifique os 3 secrets FTP e experimente
`FTP_PROTOCOL` = `ftps`. O primeiro envio cria `.ftp-deploy-sync-state.json` no servidor;
não o apague (é o que permite enviar só os ficheiros alterados).
