# PROMETO DE APP WEB DE HOSPEDAGEM MVP

## DESCRIÇÃO
Hosp é um App Web de controle de hospedagem simples, porém visualmente profissional. Para hospedarias de pequeno a medio porte. Não é necessário sistemas complexos de Auth, tendo em vista que o projeto é para controle interno de hospedes, fluxo de caixa e outras funcionalidades. Devemos pensar no Hosp como um app de gestão de hospedagem semi automatizaddo.

## ESTRUTURA MACRO DO PROJETO

1. Land: Diretorio da langind page do projeto, onde clientes podem conhecer sobre a hospedagem, serem direcionados para a página de reservas e serem direcionados para o whatsapp.

2. Frontend-app: Interface de hospedes para escolha e agendamento de quartos.
3. Frontend-admin: Interface para controle de quartos, usuários e gestão simples financeira.
4. Backend: Backend e banco de dados do projeto.

## STACK TECNOLOGICA DIVIDIDA POR PROJETO.

* Landing Page:
 - Next.js
 - Typescript
 - Shadcn UI
 - Tailwind
 - Lucide Icons
 - etc.

* Frontend-app: 
 - Next.js
 - Typescript
 - Shadcn UI
 - Tailwind
 - Auth: Sem autenticação. Frontend publico.
 - Lucide Icons
 - PWA Next

* Frontend-admin: 
 - Next.js
 - Typescript
 - Shadcn UI
 - Tailwind
 - Auth: Sem autenticação
 - Lucide Icons

* Backend:
 - Node.js
 - Typescript
 - Auth: Sem autenticação, apenas paginas protegidas de maneira basica.
 - Sqlite 3
 - ORM Prisma
 - OpenAPI (Swagger)
 - etc.