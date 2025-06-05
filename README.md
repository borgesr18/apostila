# Receitas de Pães

Esta é uma apostila interativa de receitas de pães implementada somente com HTML e JavaScript. Todas as receitas são carregadas no navegador e podem ser editadas livremente. As alterações permanecem apenas no `localStorage` do seu navegador.

## Executando localmente

Como o projeto usa módulos JavaScript, é essencial servi-lo via HTTP para evitar problemas de carregamento. **Não abra o `index.html` diretamente pelo navegador**, pois algumas funcionalidades deixarão de funcionar. Se você possui o Python instalado, execute na pasta do projeto:

```bash
python3 -m http.server
```

Em seguida, acesse `http://localhost:8000` no navegador de sua preferência.

## Salvando e editando receitas

Clique em **Editar Receita** para modificar qualquer preparo. Depois utilize **Salvar Localmente** para gravar as mudanças no `localStorage`. Para compartilhar suas alterações, clique em **Imprimir Receita** ou utilize o botão de download para gerar um novo arquivo HTML.

## Licença

Distribuído sob a [Licença MIT](LICENSE).

## Testes

Para rodar os testes unitários e de interface, instale as dependências com `npm install`. Em seguida execute:

```bash
npm test            # executa testes unitários com Jest
npm run cypress:open  # abre o Cypress para testes de interface
```
