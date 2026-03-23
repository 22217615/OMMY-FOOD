<?php
// admin/contacts.php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

include '../api/config.php';

// Marquer un message comme lu
if (isset($_POST['mark_read']) && isset($_POST['contact_id'])) {
    $contactId = $_POST['contact_id'];
    $stmt = $pdo->prepare("UPDATE contacts SET status = 'lu' WHERE id = :id");
    $stmt->execute([':id' => $contactId]);
    header('Location: contacts.php');
    exit;
}

// Supprimer un message
if (isset($_POST['delete_contact']) && isset($_POST['contact_id'])) {
    $contactId = $_POST['contact_id'];
    $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = :id");
    $stmt->execute([':id' => $contactId]);
    header('Location: contacts.php');
    exit;
}

// Récupérer tous les messages
$stmt = $pdo->query("SELECT * FROM contacts ORDER BY created_at DESC");
$contacts = $stmt->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages - OMMY-FOOD Admin</title>
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
                <li class="active"><a href="contacts.php"><i class="fas fa-envelope"></i> Messages</a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
            </ul>
        </div>
        
        <div class="main-content">
            <div class="top-bar">
                <h1>Messages des clients</h1>
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <?= htmlspecialchars($_SESSION['admin_username']) ?>
                </div>
            </div>
            
            <div class="contacts-list">
                <h2><i class="fas fa-envelope"></i> Tous les messages</h2>
                
                <?php if (count($contacts) > 0): ?>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 1rem; text-align: left;">ID</th>
                                    <th style="padding: 1rem; text-align: left;">Nom</th>
                                    <th style="padding: 1rem; text-align: left;">Email</th>
                                    <th style="padding: 1rem; text-align: left;">Téléphone</th>
                                    <th style="padding: 1rem; text-align: left;">Sujet</th>
                                    <th style="padding: 1rem; text-align: left;">Message</th>
                                    <th style="padding: 1rem; text-align: left;">Date</th>
                                    <th style="padding: 1rem; text-align: left;">Statut</th>
                                    <th style="padding: 1rem; text-align: left;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($contacts as $contact): ?>
                                <tr style="border-bottom: 1px solid #e0e0e0;">
                                    <td style="padding: 1rem;">#<?= $contact['id'] ?></td>
                                    <td style="padding: 1rem;"><strong><?= htmlspecialchars($contact['name']) ?></strong></td>
                                    <td style="padding: 1rem;"><?= htmlspecialchars($contact['email']) ?></td>
                                    <td style="padding: 1rem;"><?= htmlspecialchars($contact['phone'] ?? '-') ?></td>
                                    <td style="padding: 1rem;">
                                        <span style="background:#e9ecef; padding:0.2rem 0.5rem; border-radius:5px;">
                                            <?= htmlspecialchars($contact['subject']) ?>
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        <?= htmlspecialchars(substr($contact['message'], 0, 50)) ?>...
                                    </td>
                                    <td style="padding: 1rem;"><?= date('d/m/Y H:i', strtotime($contact['created_at'])) ?></td>
                                    <td style="padding: 1rem;">
                                        <?php if ($contact['status'] == 'non_lu'): ?>
                                            <span style="background:#fff3cd; color:#856404; padding:0.3rem 0.8rem; border-radius:50px; font-size:0.8rem;">📩 Non lu</span>
                                        <?php else: ?>
                                            <span style="background:#d4edda; color:#155724; padding:0.3rem 0.8rem; border-radius:50px; font-size:0.8rem;">✅ Lu</span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <button onclick="showMessage(<?= $contact['id'] ?>, '<?= addslashes($contact['name']) ?>', '<?= addslashes($contact['email']) ?>', '<?= addslashes($contact['phone']) ?>', '<?= addslashes($contact['subject']) ?>', `<?= addslashes($contact['message']) ?>`, '<?= $contact['created_at'] ?>')" 
                                                style="background:#0077b6; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer;">
                                            <i class="fas fa-eye"></i> Lire
                                        </button>
                                        
                                        <?php if ($contact['status'] == 'non_lu'): ?>
                                            <form method="POST" style="display: inline-block; margin-left: 0.3rem;">
                                                <input type="hidden" name="contact_id" value="<?= $contact['id'] ?>">
                                                <button type="submit" name="mark_read" style="background:#28a745; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer;">
                                                    <i class="fas fa-check"></i> Marquer lu
                                                </button>
                                            </form>
                                        <?php endif; ?>
                                        
                                        <form method="POST" style="display: inline-block; margin-left: 0.3rem;" onsubmit="return confirm('Supprimer ce message ?')">
                                            <input type="hidden" name="contact_id" value="<?= $contact['id'] ?>">
                                            <button type="submit" name="delete_contact" style="background:#dc3545; color:white; border:none; padding:0.3rem 0.8rem; border-radius:5px; cursor:pointer;">
                                                <i class="fas fa-trash"></i> Supprimer
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <p style="text-align: center; padding: 2rem;">📭 Aucun message pour le moment</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <!-- Modal -->
    <div id="messageModal" style="display: none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;">
        <div style="background:white; padding:2rem; border-radius:10px; max-width:500px; width:90%;">
            <h3><i class="fas fa-envelope"></i> Détail du message</h3>
            <div id="modalContent"></div>
            <button onclick="closeModal()" style="background:#6c757d; color:white; border:none; padding:0.5rem 1rem; border-radius:5px; margin-top:1rem; cursor:pointer;">Fermer</button>
        </div>
    </div>
    
    <script>
        function showMessage(id, name, email, phone, subject, message, date) {
            const modal = document.getElementById('messageModal');
            const modalContent = document.getElementById('modalContent');
            
            modalContent.innerHTML = `
                <div style="margin:1rem 0; padding:1rem; background:#f8f9fa; border-radius:5px;">
                    <p><strong>Nom :</strong> ${name}</p>
                    <p><strong>Email :</strong> ${email}</p>
                    <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
                    <p><strong>Sujet :</strong> ${subject}</p>
                    <p><strong>Date :</strong> ${new Date(date).toLocaleString()}</p>
                    <hr>
                    <p><strong>Message :</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
        
        function closeModal() {
            document.getElementById('messageModal').style.display = 'none';
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('messageModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    </script>
</body>
</html>