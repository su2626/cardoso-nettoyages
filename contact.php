<?php
/* =============================================================
   CARDOSO NETTOYAGES SÀRL — TRAITEMENT DU FORMULAIRE DE CONTACT
   Validation serveur, anti-spam basique, envoi par mail()
   ============================================================= */

// En-têtes : on répond toujours en JSON
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Seules les requêtes POST sont acceptées
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée.'
    ]);
    exit;
}

/* =====================================================
   CONFIGURATION
===================================================== */
$destinataire = 'contact@cardoso-nettoyages.ch'; // À adapter à l'e-mail réel
$expediteur_systeme = 'noreply@cardoso-nettoyages.ch';
$objet_prefix = '[Site Web] ';

/* =====================================================
   1. RÉCUPÉRATION & NETTOYAGE DES CHAMPS
===================================================== */
function clean($value) {
    if ($value === null) return '';
    return trim(strip_tags($value));
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');
$consent = isset($_POST['consent']);

/* =====================================================
   2. VALIDATION CÔTÉ SERVEUR
===================================================== */
$errors = [];

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = 'Le nom est requis (au moins 2 caractères).';
}
if (mb_strlen($name) > 100) {
    $errors[] = 'Le nom est trop long.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Une adresse e-mail valide est requise.';
}

if ($phone !== '' && !preg_match('/^[\+0-9\s\.\-\(\)]{6,25}$/', $phone)) {
    $errors[] = 'Le numéro de téléphone semble invalide.';
}

$allowed_subjects = ['entretien', 'chantier', 'conciergerie', 'autre'];
if (!in_array($subject, $allowed_subjects, true)) {
    $errors[] = 'Merci de sélectionner un type de demande.';
}

if ($message === '' || mb_strlen($message) < 10) {
    $errors[] = 'Le message doit contenir au moins 10 caractères.';
}
if (mb_strlen($message) > 5000) {
    $errors[] = 'Le message est trop long (max. 5000 caractères).';
}

if (!$consent) {
    $errors[] = 'Vous devez accepter le traitement de vos données.';
}

/* =====================================================
   3. ANTI-SPAM BASIQUE
===================================================== */
// Détection d'URLs multiples (typique du spam)
if (preg_match_all('/https?:\/\//i', $message) > 2) {
    $errors[] = 'Trop de liens détectés dans votre message.';
}

// Détection de caractères de contrôle dans l'en-tête potentielle
foreach ([$name, $email] as $field) {
    if (preg_match('/[\r\n]/', $field)) {
        $errors[] = 'Caractères interdits détectés.';
        break;
    }
}

/* =====================================================
   4. RÉPONSE EN CAS D'ERREUR
===================================================== */
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

/* =====================================================
   5. CONSTRUCTION DE L'E-MAIL
===================================================== */
$subject_labels = [
    'entretien'    => "Contrat d'entretien",
    'chantier'     => 'Fin de chantier / déménagement',
    'conciergerie' => 'Conciergerie',
    'autre'        => 'Autre demande'
];
$subject_label = $subject_labels[$subject] ?? 'Demande générale';

$mail_subject = $objet_prefix . $subject_label . ' — ' . $name;

$mail_body  = "Nouvelle demande reçue depuis le site Cardoso Nettoyages\r\n";
$mail_body .= "====================================================\r\n\r\n";
$mail_body .= "Nom            : $name\r\n";
$mail_body .= "E-mail         : $email\r\n";
$mail_body .= "Téléphone      : " . ($phone !== '' ? $phone : '(non renseigné)') . "\r\n";
$mail_body .= "Type de demande: $subject_label\r\n";
$mail_body .= "Date           : " . date('d.m.Y H:i') . "\r\n\r\n";
$mail_body .= "Message :\r\n";
$mail_body .= "--------\r\n";
$mail_body .= $message . "\r\n\r\n";
$mail_body .= "====================================================\r\n";
$mail_body .= "Envoyé automatiquement par cardoso-nettoyages.ch\r\n";

$headers   = [];
$headers[] = 'From: ' . $objet_prefix . ' <' . $expediteur_systeme . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

/* =====================================================
   6. ENVOI
===================================================== */
$sent = @mail(
    $destinataire,
    '=?UTF-8?B?' . base64_encode($mail_subject) . '?=',
    $mail_body,
    implode("\r\n", $headers)
);

/* =====================================================
   7. JOURNALISATION (optionnel — fichier log local)
===================================================== */
$log_line = sprintf(
    "[%s] %s | %s | %s | %s\n",
    date('Y-m-d H:i:s'),
    $sent ? 'OK' : 'FAIL',
    $name,
    $email,
    $subject_label
);
@file_put_contents(__DIR__ . '/contact.log', $log_line, FILE_APPEND | LOCK_EX);

/* =====================================================
   8. RÉPONSE FINALE
===================================================== */
if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Merci ' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . ' ! Votre demande a bien été envoyée. Nous vous répondrons sous 24 heures ouvrées.'
    ]);
} else {
    // L'enregistrement est réussi, mais l'envoi a échoué (config serveur)
    http_response_code(202);
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande a bien été enregistrée. Si vous ne recevez pas de réponse sous 24h, contactez-nous au 026 322 32 70.'
    ]);
}
