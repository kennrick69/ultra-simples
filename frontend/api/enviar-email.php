<?php
// ==============================================================================
// DENTAL ULTRA - ENVIO DE EMAILS
// Este arquivo deve ficar na Hostinger: /public_html/api/enviar-email.php
// ==============================================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Só aceita POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'erro' => 'Método não permitido']);
    exit();
}

// Chave secreta para autenticação (mude isso!)
$CHAVE_SECRETA = 'DENTAL_ULTRA_EMAIL_2024_SECRETKEY';

// Ler dados JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Verificar chave
if (!isset($data['chave']) || $data['chave'] !== $CHAVE_SECRETA) {
    http_response_code(403);
    echo json_encode(['success' => false, 'erro' => 'Não autorizado']);
    exit();
}

// Validar campos obrigatórios
if (empty($data['para']) || empty($data['assunto']) || empty($data['mensagem'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'erro' => 'Campos obrigatórios: para, assunto, mensagem']);
    exit();
}

$para = filter_var($data['para'], FILTER_SANITIZE_EMAIL);
$assunto = $data['assunto'];
$mensagem = $data['mensagem'];
$tipo = isset($data['tipo']) ? $data['tipo'] : 'html';

// Validar email
if (!filter_var($para, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'erro' => 'Email inválido']);
    exit();
}

// Headers do email
$headers = array();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'From: Dental Ultra <suporte@dentalultra.com.br>';
$headers[] = 'Reply-To: suporte@dentalultra.com.br';
$headers[] = 'X-Mailer: PHP/' . phpversion();

if ($tipo === 'html') {
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
}

// Tentar enviar
$enviado = mail($para, $assunto, $mensagem, implode("\r\n", $headers));

if ($enviado) {
    echo json_encode([
        'success' => true, 
        'mensagem' => 'Email enviado com sucesso',
        'para' => $para
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'erro' => 'Falha ao enviar email. Verifique as configurações do servidor.'
    ]);
}
?>
