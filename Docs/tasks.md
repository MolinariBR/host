# Tasks de Refatoracao

## Regras de Execucao
- [x] R0.1 Usar `backend/openapi/openapi.yaml` como contrato unico da API.
- [x] R0.2 Usar `backend/prisma/schema.prisma` como modelo unico de dados.
- [x] R0.3 Garantir seed idempotente em `backend/prisma/seed.ts`.
- [x] R0.4 Nao adicionar novos hardcodes de negocio em componentes.
- [x] R0.5 Manter implementacao simples e incremental.

## Fase 1 - Fundacao Tecnica
Meta: backend sobe, schema aplica e seed roda.

- [x] T1 Criar estrutura base do backend (app, rotas, controladores, servicos, repositorios).
- [x] T1.1 Configurar scripts de dev, build, migrate e seed.
- [x] T1.2 Configurar variaveis de ambiente (`DATABASE_URL`, JWT secret, telefone WhatsApp).
- [x] T1.3 Criar endpoint `/health` e validar resposta.
- [x] T1.4 Rodar migracao inicial do Prisma (fallback manual com `migration.sql` aplicado no SQLite devido erro do engine no ambiente).
- [x] T1.5 Rodar seed e validar dados minimos no banco.
- [x] T1.6 Registrar instrucoes de setup rapido no README tecnico.

## Fase 2 - Fluxo Publico de Reserva
Meta: usuario cria e consulta reserva sem login.

- [x] T2 Implementar `POST /bookings`.
- [x] T2.1 Validar periodo de hospedagem (check-in < check-out).
- [x] T2.2 Validar capacidade do quarto.
- [x] T2.3 Calcular total da reserva (diarias + servicos).
- [x] T2.4 Gerar `bookingCode` unico.
- [x] T2.5 Persistir status inicial `PENDING` + `PENDING_WHATSAPP`.
- [x] T2.6 Retornar payload conforme OpenAPI.

- [x] T3 Implementar `GET /bookings/lookup`.
- [x] T3.1 Filtrar por email obrigatorio.
- [x] T3.2 Permitir filtro opcional por `bookingCode`.
- [x] T3.3 Retornar lista padronizada de reservas publicas.

- [x] T4 Implementar `GET /bookings/{bookingCode}/whatsapp-link`.
- [x] T4.1 Montar mensagem padrao sem hardcode em controller.
- [x] T4.2 Usar telefone centralizado em configuracao/perfil do hotel.
- [x] T4.3 Retornar URL pronta para abertura no frontend.

## Fase 3 - Acesso Administrativo
Meta: autenticacao admin simples e segura para MVP.

- [x] T5 Implementar `POST /admin/auth/login`.
- [x] T5.1 Validar credenciais contra `AdminUser`.
- [x] T5.2 Gerar token de sessao (JWT simples).
- [x] T5.3 Retornar dados minimos do admin autenticado.

- [x] T6 Proteger rotas administrativas.
- [x] T6.1 Criar middleware de autenticacao.
- [x] T6.2 Aplicar middleware em `/admin/*` (exceto login).
- [ ] T6.3 Padronizar erros 401/403.

## Fase 4 - Gestao Administrativa
Meta: CRUDs essenciais com dados reais.

- [x] T7 Quartos - implementar `/admin/rooms`.
- [x] T7.1 Listar quartos.
- [x] T7.2 Criar quarto.
- [x] T7.3 Atualizar quarto.
- [x] T7.4 Excluir quarto.
- [x] T7.5 Validar unicidade de numero.

- [x] T8 Hospedes - implementar `/admin/guests`.
- [x] T8.1 Listar com busca por nome/email/telefone.
- [x] T8.2 Buscar hospede por id.

- [x] T9 Servicos - implementar `/admin/services`.
- [x] T9.1 Listar servicos.
- [x] T9.2 Criar servico.
- [x] T9.3 Atualizar servico.
- [x] T9.4 Remover/invalidar servico.

- [x] T10 Reservas admin - implementar `/admin/bookings`.
- [x] T10.1 Listar com filtros por status e periodo.
- [x] T10.2 Buscar reserva por id.
- [x] T10.3 Atualizar status/pagamento/observacoes.
- [x] T10.4 Registrar transicoes validas de status.

## Fase 5 - Relatorios
Meta: dashboard admin alimentado por dados reais.

- [x] T11 Implementar `/admin/reports/summary`.
- [x] T11.1 Calcular receita total por periodo.
- [x] T11.2 Calcular taxa de ocupacao.
- [x] T11.3 Calcular volume de reservas.
- [x] T11.4 Gerar agregado por quarto.
- [x] T11.5 Garantir resposta no formato do OpenAPI.

## Fase 6 - Frontend sem Hardcode
Meta: remover mocks e textos fixos inconsistentes.

- [x] T12 Integrar frontend de reservas com API publica.
- [x] T12.1 Formulario de reserva enviar para `POST /bookings`.
- [x] T12.2 Tela de confirmacao consumir `bookingCode` e link WhatsApp.
- [x] T12.3 Tela de consulta por email consumir `GET /bookings/lookup`.

- [x] T13 Integrar frontend admin com API protegida.
- [x] T13.1 Login admin real.
- [x] T13.2 Tela de quartos com dados da API.
- [x] T13.3 Tela de reservas com dados da API.
- [x] T13.4 Tela de hospedes com dados da API.
- [x] T13.5 Tela de servicos com dados da API.
- [x] T13.6 Dashboard/relatorios com dados da API.

- [x] T14 Ajustar conteudo institucional.
- [x] T14.1 Telefone, CNPJ e localizacao vindos de fonte centralizada.
- [x] T14.2 Footer com localizacao correta e link Google Maps.
- [x] T14.3 Link Google Business e avaliacoes.
- [x] T14.4 Textos alinhados com `Docs/historia.md` e `Docs/IMPLEMENT.md`.

## Fase 7 - Qualidade e Entrega
Meta: estabilidade minima para operacao.

- [x] T15 Criar testes minimos de integracao para fluxos criticos.
- [x] T15.1 Health check.
- [x] T15.2 Criacao de reserva.
- [x] T15.3 Lookup de reservas por email.
- [x] T15.4 Login admin e rota protegida.

- [x] T16 Revisao final de hardcode.
- [x] T16.1 Auditar strings e valores sensiveis no frontend.
- [x] T16.2 Auditar parametros de negocio no backend.
- [x] T16.3 Mover constantes para configuracao quando necessario.

- [x] T17 Checklist de aceite final.
- [x] T17.1 Fluxo publico validado ponta a ponta.
- [x] T17.2 Fluxo admin validado ponta a ponta.
- [x] T17.3 Relatorios validos para periodo.
- [x] T17.4 Documentacao atualizada.
