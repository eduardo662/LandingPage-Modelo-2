<?php
/**
 * Editor10K - Processador de Formulário Seguro
 * Este arquivo processa o formulário de inscrição com medidas de segurança
 */

// Iniciar sessão para gerenciar tokens CSRF
session_start();

// Configurações de segurança
ini_set('display_errors', 0);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Content-Security-Policy: default-src \'self\'');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Definir tempo limite para evitar ataques de força bruta
$timeout = 2; // segundos
sleep($timeout);

// Função para resposta JSON
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Verificar método de requisição
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método não permitido');
}

// Verificar token CSRF
if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    jsonResponse(false, 'Erro de segurança: token inválido');
}

// Verificar campo honeypot (deve estar vazio)
if (isset($_POST['website']) && !empty($_POST['website'])) {
    // Bot detectado, mas retornamos uma resposta normal para não alertar o bot
    jsonResponse(true, 'Formulário enviado com sucesso');
}

// Validar campos obrigatórios
$requiredFields = ['nome', 'email', 'whatsapp'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        jsonResponse(false, 'Todos os campos são obrigatórios');
    }
}

// Sanitizar e validar dados
$nome = filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_SPECIAL_CHARS);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$whatsapp = filter_input(INPUT_POST, 'whatsapp', FILTER_SANITIZE_SPECIAL_CHARS);

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'E-mail inválido');
}

// Validar formato do WhatsApp
if (!preg_match('/^\([0-9]{2}\)\s?[0-9]{4,5}-[0-9]{4}$/', $whatsapp)) {
    jsonResponse(false, 'Número de WhatsApp inválido');
}

// Validar nome (apenas letras, espaços e acentos)
if (!preg_match('/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{3,100}$/', $nome)) {
    jsonResponse(false, 'Nome inválido');
}

// Registrar tentativa no log (com dados sanitizados)
$logMessage = date('Y-m-d H:i:s') . " - Inscrição: " . 
              "Nome: " . substr($nome, 0, 30) . ", " . 
              "Email: " . substr($email, 0, 30) . ", " . 
              "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

$logFile = 'inscricoes.log';
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Limitar acesso ao arquivo de log
chmod($logFile, 0600);

// Aqui você processaria os dados (enviar email, salvar no banco de dados, etc.)
// ...

// Gerar novo token CSRF para a próxima requisição
$newToken = bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $newToken;

// Retornar resposta de sucesso
jsonResponse(true, 'Inscrição realizada com sucesso! Em breve entraremos em contato.', ['new_token' => $newToken]);
?> 