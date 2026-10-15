# Deploy estático na Hostnet (FTP)

Este projeto foi configurado para gerar um site **100% estático** (HTML + CSS + JS)
que roda em qualquer hospedagem compartilhada com Apache/Nginx — **sem Node.js,
sem SSR, sem Cloudflare Workers no servidor**.

## Resultado do build

Ao rodar `npm run build:static` **no seu computador ou no GitHub Actions**, o script
gera a pasta `dist/` com:

```
dist/
├── index.html          ← página inicial do SPA estático (obrigatória)
├── .htaccess           ← fallback SPA para Apache/Hostnet
├── assets/             ← imagens, fontes, logos
├── favicon.ico
└── robots.txt
```

É o conteúdo dessa pasta `dist/` que você envia por FTP para `/www/` na Hostnet.

## Como o build estático funciona

O comando `npm run build:static` usa uma configuração Vite SPA dedicada
(`vite.static.config.ts`). Esse build não usa TanStack Start, Nitro, SSR,
Wrangler, Cloudflare Worker nem prerender. A saída final é uma aplicação SPA
100% estática em `dist/`. O `.htaccess` faz qualquer URL interna voltar para
`index.html` em hospedagem Apache/Hostnet.

## Opção A — Build no seu computador

Requer Node.js 20+ (https://nodejs.org).

```bash
git clone <seu-repo>
cd converta-ai
npm install
npm run build:static
```

Ao final aparecerá:

```
[postbuild] Bundle estático pronto em dist/:
  dir   assets
  file  .htaccess
  file  favicon.ico
  file  index.html
  file  robots.txt
```

Abra um cliente FTP (FileZilla, WinSCP, Cyberduck), conecte na Hostnet e
**envie todo o conteúdo de `dist/` para `/www/`**. Não envie a pasta `dist`
em si — envie **os arquivos que estão dentro dela**, para que o `index.html`
fique diretamente em `/www/index.html`.

Acesse seu domínio — o site está no ar.

## Opção B — Deploy automático (GitHub Actions)

O workflow em `.github/workflows/deploy.yml` já está configurado para:

1. Instalar dependências (`npm install`)
2. Rodar `npm run build:static` (gera `dist/`)
3. Enviar `./dist/` → `/www/` via FTP

Configure os secrets no GitHub (**Settings → Secrets and variables → Actions**):

| Secret         | Valor                                    |
| -------------- | ---------------------------------------- |
| `FTP_SERVER`   | Ex.: `ftp.dinamicasolucao.com.br`        |
| `FTP_USERNAME` | Usuário FTP fornecido pela Hostnet       |
| `FTP_PASSWORD` | Senha FTP fornecida pela Hostnet         |

Cada `git push` na branch `main` publica automaticamente na Hostnet.

## Diretório correto para o deploy

Sempre use **`dist/`**. O caminho `.output/public/` não é usado no build FTP;
o build estático não depende de Nitro nem de servidor SSR.

## Arquivos obrigatórios para hospedagem compartilhada

| Arquivo/Pasta   | Obrigatório? | Papel                                       |
| --------------- | ------------ | ------------------------------------------- |
| `index.html`    | **Sim**      | Página inicial servida em `/`               |
| `assets/`       | **Sim**      | JS/CSS/imagens carregados pelo `index.html` |
| `.htaccess`     | Recomendado  | Fallback SPA + cache dos assets no Apache   |
| `favicon.ico`   | Opcional     | Ícone da aba do navegador                   |
| `robots.txt`    | Opcional     | Instruções para crawlers                    |

## Sem Node.js no servidor

- Nenhum arquivo em `dist/` requer runtime.
- Todo o roteamento após o carregamento inicial acontece no cliente (TanStack Router).
- O build estático não gera `.output/server`, Wrangler, Cloudflare Worker nem bundle SSR.
- `ChatWidget` e `ContactForm` funcionam 100% no navegador (o formulário
  abre o WhatsApp com a mensagem preenchida).

## Se aparecer 403 Forbidden

- Confirme que **`index.html` está diretamente em `/www/`**, não em
  `/www/dist/index.html`.
- Confirme que o `.htaccess` também foi enviado (arquivos iniciados por `.`
  às vezes ficam ocultos no cliente FTP — habilite "mostrar arquivos ocultos").

## Se aparecer 404 ao atualizar página interna

- Verifique se o `.htaccess` está presente em `/www/`.
- Confirme que o módulo `mod_rewrite` está ativo (Hostnet ativa por padrão).
