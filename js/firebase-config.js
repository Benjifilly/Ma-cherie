// Configuration Firebase pour Ben-Bot
// Les clés sensibles sont injectées via GitHub Actions lors du déploiement

const firebaseConfig = {
    apiKey: "{{FIREBASE_API_KEY}}", // Sera remplacé par GitHub Actions
    authDomain: "ma-cherie-af625.firebaseapp.com",
    databaseURL: "https://ma-cherie-af625-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ma-cherie-af625",
    storageBucket: "ma-cherie-af625.firebasestorage.app",
    messagingSenderId: "405191992200",
    appId: "1:405191992200:web:8b9eda534715074c75d03d",
    measurementId: "G-F94RGQPDBT"
};

// Initialiser Firebase
let database;
let firebaseInitialized = false;

async function initializeFirebase() {
    try {
        // Vérifier si Firebase est déjà disponible
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK non chargé - mode historique local activé');
            return false;
        }

        // Initialiser Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        database = firebase.database();
        firebaseInitialized = true;
        console.log('Firebase initialisé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
        console.warn('Mode historique local activé');
        return false;
    }
}

// Système d'historique de conversation public
class ConversationHistory {
    constructor() {
        this.localStorageKey = 'ben_bot_local_history';
        this.isOnline = false;
        this.conversationRef = null;
    }

    async initialize() {
        this.isOnline = await initializeFirebase();
        
        if (this.isOnline) {
            // Référence vers les conversations publiques dans Firebase
            this.conversationRef = database.ref('public_conversations');
            
            // Nettoyer les anciennes conversations (garder seulement les 7 derniers jours)
            this.cleanOldConversations();
        }
        
        console.log(`Historique initialisé en mode ${this.isOnline ? 'en ligne' : 'local'}`);
    }

    // Sauvegarder une conversation dans l'historique public
    async saveConversation(userMessage, botResponse) {
        const conversation = {
            user: userMessage,
            bot: botResponse,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        try {
            if (this.isOnline && this.conversationRef) {
                // Sauvegarder en ligne dans Firebase
                await this.conversationRef.push(conversation);
                console.log('Conversation sauvegardée en ligne');
            } else {
                // Sauvegarder localement
                this.saveLocally(conversation);
                console.log('Conversation sauvegardée localement');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            // Fallback vers sauvegarde locale
            this.saveLocally(conversation);
        }
    }

    // Charger l'historique des conversations publiques
    async loadHistory(limit = 50) {
        try {
            if (this.isOnline && this.conversationRef) {
                return await this.loadFromFirebase(limit);
            } else {
                return this.loadFromLocal(limit);
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return this.loadFromLocal(limit);
        }
    }

    // Charger depuis Firebase
    async loadFromFirebase(limit) {
        try {
            const snapshot = await this.conversationRef
                .orderByChild('timestamp')
                .limitToLast(limit)
                .once('value');
            
            const conversations = [];
            snapshot.forEach(child => {
                conversations.push(child.val());
            });
            
            return conversations.reverse(); // Plus récent en premier
        } catch (error) {
            console.error('Erreur Firebase:', error);
            return [];
        }
    }

    // Sauvegarder localement
    saveLocally(conversation) {
        try {
            let localHistory = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            localHistory.push(conversation);
            
            // Garder seulement les 100 dernières conversations localement
            if (localHistory.length > 100) {
                localHistory = localHistory.slice(-100);
            }
            
            localStorage.setItem(this.localStorageKey, JSON.stringify(localHistory));
        } catch (error) {
            console.error('Erreur sauvegarde locale:', error);
        }
    }

    // Charger depuis le stockage local
    loadFromLocal(limit) {
        try {
            const localHistory = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
            return localHistory.slice(-limit).reverse();
        } catch (error) {
            console.error('Erreur chargement local:', error);
            return [];
        }
    }

    // Nettoyer les anciennes conversations (Firebase)
    async cleanOldConversations() {
        if (!this.isOnline || !this.conversationRef) return;

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const snapshot = await this.conversationRef
                .orderByChild('timestamp')
                .endAt(sevenDaysAgo.toISOString())
                .once('value');
            
            const updates = {};
            snapshot.forEach(child => {
                updates[child.key] = null; // Marquer pour suppression
            });
            
            if (Object.keys(updates).length > 0) {
                await this.conversationRef.update(updates);
                console.log(`${Object.keys(updates).length} anciennes conversations supprimées`);
            }
        } catch (error) {
            console.error('Erreur lors du nettoyage:', error);
        }
    }

    // Obtenir des statistiques sur l'historique
    async getStats() {
        try {
            const history = await this.loadHistory(1000); // Charger plus pour les stats
            const today = new Date().toLocaleDateString('fr-FR');
            
            const todayCount = history.filter(conv => conv.date === today).length;
            const totalCount = history.length;
            
            return {
                totalConversations: totalCount,
                todayConversations: todayCount,
                isOnline: this.isOnline
            };
        } catch (error) {
            console.error('Erreur stats:', error);
            return {
                totalConversations: 0,
                todayConversations: 0,
                isOnline: false
            };
        }
    }

    // Vider l'historique (pour le mode admin)
    async clearHistory() {
        try {
            if (this.isOnline && this.conversationRef) {
                await this.conversationRef.remove();
                console.log('Historique Firebase vidé');
            }
            
            localStorage.removeItem(this.localStorageKey);
            console.log('Historique local vidé');
        } catch (error) {
            console.error('Erreur lors du vidage:', error);
        }
    }
}

// Instance globale de l'historique
const conversationHistory = new ConversationHistory();
