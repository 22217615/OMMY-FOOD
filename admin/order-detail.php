<?php
// admin/order-detail.php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

include '../api/config.php';

$orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($orderId == 0) {
    header('Location: orders.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
$stmt->execute([':id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    header('Location: orders.php');
    exit;
}

$items = json_decode($order['items'], true);

if (isset($_POST['update_status'])) {
    $newStatus = $_POST['status'];
    $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $newStatus, ':id' => $orderId]);
    
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt->execute([':id' => $orderId]);
    $order = $stmt->fetch();
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détail Commande #<?= $order['order_number'] ?> - OMMY-FOOD</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>🍽️ OMMY-FOOD</h2>
                <p>Administration</p>
            </div>
            <ul class="sidebar-menu">
                <li><a href="index.php"><i class="fas fa-tachometer-alt"></i> Tableau de bord</a></li>
                <li><a href="orders.php"><i class="fas fa-shopping-cart"></i> Commandes</a></li>
                <li><a href="contacts.php"><i class="fas fa-envelope"></i> Messages</a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
            </ul>
        </div>
        
        <div class="main-content">
            <div class="top-bar">
                <div class="detail-header">
                    <a href="orders.php" class="back-btn">
                        <i class="fas fa-arrow-left"></i> Retour aux commandes
                    </a>
                    <h1>Détail commande #<?= $order['order_number'] ?></h1>
                    <div></div>
                </div>
            </div>
            
            <div class="order-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <strong><i class="fas fa-user"></i> Client</strong>
                        <?= htmlspecialchars($order['customer_name']) ?>
                    </div>
                    <div class="summary-item">
                        <strong><i class="fas fa-phone"></i> Téléphone</strong>
                        <?= htmlspecialchars($order['customer_phone']) ?>
                    </div>
                    <div class="summary-item">
                        <strong><i class="fas fa-map-marker-alt"></i> Adresse</strong>
                        <?= htmlspecialchars($order['customer_address']) ?>
                    </div>
                    <div class="summary-item">
                        <strong><i class="fas fa-calendar"></i> Date</strong>
                        <?= date('d/m/Y H:i', strtotime($order['created_at'])) ?>
                    </div>
                    <div class="summary-item">
                        <strong><i class="fas fa-credit-card"></i> Paiement</strong>
                        <?php if ($order['payment_mode'] == 'online'): ?>
                            📱 Mobile Money
                            <?php if ($order['payment_operator']): ?>
                                <br><small>(<?= $order['payment_operator'] ?>)</small>
                            <?php endif; ?>
                        <?php else: ?>
                            💰 Cash à la livraison
                        <?php endif; ?>
                    </div>
                    <div class="summary-item">
                        <strong><i class="fas fa-truck"></i> Statut</strong>
                        <form method="POST" class="status-form">
                            <select name="status" class="status-select-large">
                                <option value="en_attente" <?= $order['status'] == 'en_attente' ? 'selected' : '' ?>>⏳ En attente</option>
                                <option value="paye" <?= $order['status'] == 'paye' ? 'selected' : '' ?>>✅ Payé</option>
                                <option value="en_livraison" <?= $order['status'] == 'en_livraison' ? 'selected' : '' ?>>🚚 En livraison</option>
                                <option value="livre" <?= $order['status'] == 'livre' ? 'selected' : '' ?>>🏠 Livré</option>
                                <option value="annule" <?= $order['status'] == 'annule' ? 'selected' : '' ?>>❌ Annulé</option>
                            </select>
                            <button type="submit" name="update_status" class="btn-update-large">
                                <i class="fas fa-save"></i> Mettre à jour
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="recent-orders">
                <h2>📦 Articles commandés</h2>
                <div style="overflow-x: auto;">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Prix unitaire</th>
                                <th>Quantité</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php 
                            $grandTotal = 0;
                            if ($items && is_array($items)):
                                foreach ($items as $item): 
                                    $itemTotal = $item['price'] * ($item['quantity'] ?? 1);
                                    $grandTotal += $itemTotal;
                            ?>
                                <tr>
                                    <td><strong><?= htmlspecialchars($item['name']) ?></strong></td>
                                    <td><?= number_format($item['price'], 0) ?> FC</td>
                                    <td><?= $item['quantity'] ?? 1 ?></td>
                                    <td><?= number_format($itemTotal, 0) ?> FC</td>
                                </tr>
                            <?php 
                                endforeach;
                            endif;
                            ?>
                        </tbody>
                    </table>
                </div>
                <div class="total-box">
                    <strong>Total : <?= number_format($grandTotal, 0) ?> FC</strong>
                </div>
            </div>
        </div>
    </div>
</body>
</html>