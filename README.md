
# Apostila de Pães

Esta é uma apostila interativa de receitas de pães feita em HTML e JavaScript puro. As receitas são carregadas do browser e podem ser editadas diretamente na página, ficando salvas no `localStorage` do navegador.

## Executando localmente

Para evitar problemas de carregamento de módulos, recomenda-se servir os arquivos com um servidor HTTP simples. Em ambientes com Python instalado, execute na raiz do projeto:

# Receitas de Pães

Esta é uma apostila interativa de receitas de pães implementada somente com HTML e JavaScript. Todas as receitas são carregadas no navegador e podem ser editadas livremente. As alterações permanecem apenas no `localStorage` do seu navegador.

## Executando localmente

Como o projeto usa módulos JavaScript, é essencial servi-lo via HTTP para evitar problemas de carregamento. **Não abra o `index.html` diretamente pelo navegador**, pois algumas funcionalidades deixarão de funcionar. Se você possui o Python instalado, execute na pasta do projeto:


```bash
python3 -m http.server
```


Depois abra `http://localhost:8000` no navegador.

## Salvando e editando receitas

Ao abrir a página você pode alternar para o modo de edição para personalizar as receitas. As alterações ficam armazenadas apenas no seu navegador. Caso queira compartilhar, utilize o botão de download para gerar um HTML com suas modificações.


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
