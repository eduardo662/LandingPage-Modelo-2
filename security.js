/**
 * Editor10K - Script de Segurança
 * Este arquivo contém medidas de segurança para proteger o site contra ataques comuns
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gerar token CSRF
    const csrfToken = generateCSRFToken();
    const csrfTokenField = document.getElementById('csrf_token');
    if (csrfTokenField) {
        csrfTokenField.value = csrfToken;
        // Armazenar o token no sessionStorage para validação posterior
        sessionStorage.setItem('csrf_token', csrfToken);
    }

    // Configurar validação de formulário
    setupFormValidation();

    // Proteção contra XSS em URLs
    sanitizeQueryParams();

    // Proteção contra clickjacking
    preventClickjacking();

    // Proteção contra ataques de timing
    implementRateLimiting();
});

/**
 * Gera um token CSRF aleatório
 */
function generateCSRFToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Configura a validação do formulário
 */
function setupFormValidation() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    // Validação de campos
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const whatsappInput = document.getElementById('whatsapp');
    const submitBtn = document.getElementById('submitBtn');

    // Formatar campo de WhatsApp
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 3) {
                    value = value.substring(0, 3) + ') ' + value.substring(3);
                }
                if (value.length > 10) {
                    value = value.substring(0, 10) + '-' + value.substring(10);
                }
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }
            }
            e.target.value = value;
        });
    }

    // Validação em tempo real
    const inputs = [nomeInput, emailInput, whatsappInput];
    inputs.forEach(input => {
        if (!input) return;
        
        input.addEventListener('blur', function() {
            validateInput(input);
        });
    });

    // Validação no envio do formulário
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar se o campo honeypot está vazio (deve estar vazio para usuários reais)
            const honeypot = document.getElementById('website');
            if (honeypot && honeypot.value) {
                console.log('Bot detectado!');
                return false;
            }
            
            // Validar todos os campos
            let isValid = true;
            inputs.forEach(input => {
                if (!validateInput(input)) {
                    isValid = false;
                }
            });
            
            // Verificar token CSRF
            const storedToken = sessionStorage.getItem('csrf_token');
            const formToken = csrfTokenField.value;
            
            if (!storedToken || !formToken || storedToken !== formToken) {
                showError('Erro de segurança: token inválido. Por favor, recarregue a página.');
                isValid = false;
            }
            
            if (isValid) {
                // Desativar o botão para evitar múltiplos envios
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'PROCESSANDO...';
                }
                
                // Simular envio do formulário (em produção, você enviaria para o servidor)
                setTimeout(() => {
                    // Aqui você enviaria os dados para o servidor
                    showSuccess('Inscrição realizada com sucesso! Em breve entraremos em contato.');
                    form.reset();
                    
                    // Reativar o botão
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'QUERO COMEÇAR AGORA!';
                    }
                    
                    // Gerar novo token CSRF
                    const newToken = generateCSRFToken();
                    csrfTokenField.value = newToken;
                    sessionStorage.setItem('csrf_token', newToken);
                }, 1500);
            }
        });
    }
}

/**
 * Valida um campo de entrada
 */
function validateInput(input) {
    if (!input) return true;
    
    const errorElement = document.getElementById(`${input.id}-error`);
    
    // Remover classes de erro
    input.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    // Verificar se o campo está vazio
    if (!input.value.trim()) {
        showInputError(input, errorElement, 'Este campo é obrigatório');
        return false;
    }
    
    // Verificar se o padrão é válido
    if (input.pattern && !new RegExp(input.pattern).test(input.value)) {
        showInputError(input, errorElement, input.title || 'Formato inválido');
        return false;
    }
    
    // Validações específicas por tipo de campo
    if (input.id === 'email') {
        // Validação adicional de email
        if (!validateEmail(input.value)) {
            showInputError(input, errorElement, 'Por favor, insira um e-mail válido');
            return false;
        }
    } else if (input.id === 'whatsapp') {
        // Validação adicional de telefone
        if (!validatePhone(input.value)) {
            showInputError(input, errorElement, 'Por favor, insira um número no formato (99) 99999-9999');
            return false;
        }
    }
    
    return true;
}

/**
 * Mostra erro em um campo específico
 */
function showInputError(input, errorElement, message) {
    input.classList.add('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Valida um endereço de e-mail
 */
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Valida um número de telefone
 */
function validatePhone(phone) {
    const re = /^\([0-9]{2}\)\s?[0-9]{4,5}-[0-9]{4}$/;
    return re.test(phone);
}

/**
 * Sanitiza parâmetros de URL para prevenir XSS
 */
function sanitizeQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    let hasXSS = false;
    
    // Verificar cada parâmetro
    for (const [key, value] of urlParams.entries()) {
        // Verificar padrões suspeitos de XSS
        if (/<script|javascript:|onerror=|onload=|eval\(|setTimeout\(|document\.cookie/i.test(value)) {
            hasXSS = true;
            // Remover parâmetro suspeito
            urlParams.delete(key);
        }
    }
    
    // Se encontrou XSS, redirecionar para URL limpa
    if (hasXSS) {
        const cleanUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState({}, document.title, cleanUrl);
        console.warn('Parâmetros suspeitos foram removidos da URL');
    }
}

/**
 * Previne clickjacking verificando se a página está em um iframe
 */
function preventClickjacking() {
    if (window.self !== window.top) {
        // A página está em um iframe
        document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h1>Acesso Negado</h1><p>Esta página não pode ser exibida em um iframe por motivos de segurança.</p></div>';
        console.error('Tentativa de clickjacking detectada!');
    }
}

/**
 * Implementa limitação de taxa para prevenir ataques de força bruta
 */
function implementRateLimiting() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    
    let clickCount = 0;
    const maxClicks = 5;
    const resetTime = 60000; // 1 minuto
    
    submitBtn.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount > maxClicks) {
            submitBtn.disabled = true;
            showError('Muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.');
            
            setTimeout(() => {
                clickCount = 0;
                submitBtn.disabled = false;
                const errorMessages = document.querySelectorAll('.security-message.error');
                errorMessages.forEach(msg => msg.remove());
            }, resetTime);
        }
    });
}

/**
 * Mostra uma mensagem de erro
 */
function showError(message) {
    const form = document.getElementById('signupForm');
    if (!form) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'security-message error';
    errorDiv.textContent = message;
    
    form.prepend(errorDiv);
    
    // Remover a mensagem após 5 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Mostra uma mensagem de sucesso
 */
function showSuccess(message) {
    const form = document.getElementById('signupForm');
    if (!form) return;
    
    const successDiv = document.createElement('div');
    successDiv.className = 'security-message';
    successDiv.textContent = message;
    
    form.prepend(successDiv);
    
    // Remover a mensagem após 5 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
} 