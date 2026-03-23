<?php
// api/save-order.php
// Sauvegarder une commande dans la base de données

// Autoriser les requêtes depuis le site
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Inclure la connexion
include 'config.php';

// Lire les données JSON envoyées
$data = json_decode(file_get_contents("php://input"), true);

// Vérifier que les données sont présentes
if (!$data) {
    echo json_encode(["success" => false, "message" => "Aucune donnée reçue"]);
    exit;
}

// Récupérer les données
$order_number = 'ORD-' . date('YmdHis');
$customer_name = $data['customer']['name'] ?? '';
$customer_phone = $data['customer']['phone'] ?? '';
$customer_address = $data['customer']['address'] ?? '';
$items = json_encode($data['items'] ?? []);
$total = $data['total'] ?? 0;
$payment_mode = $data['paymentMode'] ?? 'cash';
$payment_operator = $data['paymentDetails']['method'] ?? null;

// Validation
if (empty($customer_name) || empty($customer_phone) || empty($customer_address)) {
    echo json_encode(["success" => false, "message" => "Données client incomplètes"]);
    exit;
}

try {
    // Insérer dans la base
    $sql = "INSERT INTO orders (order_number, customer_name, customer_phone, customer_address, items, total, payment_mode, payment_operator, created_at) 
            VALUES (:order_number, :customer_name, :customer_phone, :customer_address, :items, :total, :payment_mode, :payment_operator, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':order_number' => $order_number,
        ':customer_name' => $customer_name,
        ':customer_phone' => $customer_phone,
        ':customer_address' => $customer_address,
        ':items' => $items,
        ':total' => $total,
        ':payment_mode' => $payment_mode,
        ':payment_operator' => $payment_operator
    ]);
    
    $orderId = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "message" => "Commande enregistrée",
        "order_id" => $orderId,
        "order_number" => $order_number
    ]);
    
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Erreur : " . $e->getMessage()]);
}
?>