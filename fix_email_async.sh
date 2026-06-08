#!/bin/bash
TRANSFERS="$HOME/Documents/proyectos/PlataformadeComprayGestiondeCreditos/backend/src/modules/transfers/transfers.service.js"
PQRS="$HOME/Documents/proyectos/PlataformadeComprayGestiondeCreditos/backend/src/modules/pqrs/pqrs.service.js"
PAYMENTS="$HOME/Documents/proyectos/PlataformadeComprayGestiondeCreditos/backend/src/modules/payments/payments.service.js"

# En transfers: quitar await del envío de emails
sed -i 's/await enviarEmail({ to: sender/enviarEmail({ to: sender/g' "$TRANSFERS"
sed -i 's/await enviarEmail({ to: destinatario/enviarEmail({ to: destinatario/g' "$TRANSFERS"

# En pqrs: quitar await del envío de email  
sed -i 's/await enviarEmail({ to: ticketActual/enviarEmail({ to: ticketActual/g' "$PQRS"

# En payments: quitar await del envío de email
sed -i 's/await enviarEmail({ to: user/enviarEmail({ to: user/g' "$PAYMENTS"

echo "✅ Emails ahora son fire-and-forget (no bloquean la respuesta)"
