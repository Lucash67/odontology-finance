# WhatsApp — desenho futuro (não implementar agora)

## Objetivo

Automatizar comunicação de cobrança/lembrete ligada a parcelas de recebíveis, com histórico auditável.

## Gatilhos previstos

| Gatilho | Exemplo |
|---------|---------|
| Antes do vencimento | D-3 ou D-1 |
| No dia do vencimento | D0 |
| Após vencimento | D+1, D+3, D+7 (configurável) |

## Informações necessárias

### Cadastro
- Telefone WhatsApp do paciente (E.164)
- Consentimento / opt-in para cobrança
- Preferência de idioma/tom (opcional)

### Dados da mensagem
- Nome do paciente
- Dentista / clínica
- Valor da parcela
- Vencimento
- Tratamento (descrição curta)
- Link de pagamento (se existir no futuro)
- Instruções (Pix/chave) — ⚠️ confirmar

### Configuração
- Templates aprovados
- Horário permitido de envio
- Regras de silêncio (não enviar se pago)
- Limite de tentativas

## Entidades

### whatsapp_templates
- key (`reminder_d3`, `due_today`, `overdue_d3`)
- body com variáveis `{{patient_name}}`, `{{amount}}`, `{{due_date}}`
- active

### whatsapp_messages
- patient_id, installment_id (nullable)
- template_id, to_phone, body_rendered
- status (`queued`, `sent`, `delivered`, `failed`, `read` se disponível)
- provider_message_id
- error_message
- created_at, sent_at

## Provedor

**Não definido.** Opções comuns no Brasil: API oficial Meta Cloud, Z-API, Evolution API, Twilio, etc.

Critérios: custo, estabilidade, conformidade com política do WhatsApp Business, templates aprovados.

## Regras

1. Nunca enviar se parcela já estiver `paid`.
2. Registrar 100% das tentativas.
3. Respeitar opt-out.
4. Usuário pode disparar manualmente (“enviar cobrança”).
5. Fase 1 do produto: só cadastro de telefone; automação depois.

## Fora de escopo agora

- Integração real
- Chatbot
- Atendimento clínico via WhatsApp
