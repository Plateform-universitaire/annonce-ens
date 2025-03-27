import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUser, FaPaperPlane, FaBullhorn, FaSearch, FaHome, FaPoll, FaStar, FaComment, FaUserTie } from 'react-icons/fa';
import '../styles.css';

const AnnonceENS = ({ matricule, handleLogout }) => {
    console.log('AnnonceENS rendu avec matricule:', matricule);

    // États pour gérer les onglets, annonces, sondages, filtres, modales, et commentaires
    const [activeTab, setActiveTab] = useState('consulter');
    const [adminAnnonces, setAdminAnnonces] = useState([]);
    const [filteredAdminAnnonces, setFilteredAdminAnnonces] = useState([]);
    const [teacherAnnonces, setTeacherAnnonces] = useState([]);
    const [filteredTeacherAnnonces, setFilteredTeacherAnnonces] = useState([]);
    const [teacherSondages, setTeacherSondages] = useState([]);
    const [filteredTeacherSondages, setFilteredTeacherSondages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sections, setSections] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSondageModal, setShowSondageModal] = useState(false);
    const [showSondageResultsModal, setShowSondageResultsModal] = useState(false);
    const [annonceToDelete, setAnnonceToDelete] = useState(null);
    const [selectedAnnonce, setSelectedAnnonce] = useState(null);
    const [currentAnnonce, setCurrentAnnonce] = useState(null);
    const [currentSondage, setCurrentSondage] = useState(null);
    const [selectedSondage, setSelectedSondage] = useState(null);
    const [sondageResults, setSondageResults] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]); // État pour les commentaires
    const [newReplies, setNewReplies] = useState({}); // État pour les réponses temporaires

    // Charger les données initiales (annonces, sondages, sections)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Récupérer les annonces de l'administration
                const adminResponse = await fetch(`http://localhost:5002/api/annonces/admin/${matricule}`);
                if (!adminResponse.ok) {
                    const errorData = await adminResponse.json();
                    throw new Error(errorData.error || 'Erreur lors du chargement des annonces admin');
                }
                const adminData = await adminResponse.json();
                setAdminAnnonces(Array.isArray(adminData) ? adminData : []);
                setFilteredAdminAnnonces(Array.isArray(adminData) ? adminData : []);

                // Récupérer les annonces de l'enseignant
                const teacherResponse = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
                if (!teacherResponse.ok) {
                    const errorData = await teacherResponse.json();
                    throw new Error(errorData.error || 'Erreur lors du chargement des annonces enseignant');
                }
                const teacherData = await teacherResponse.json();
                setTeacherAnnonces(Array.isArray(teacherData) ? teacherData : []);
                setFilteredTeacherAnnonces(Array.isArray(teacherData) ? teacherData : []);

                // Récupérer les sondages de l'enseignant
                const sondagesResponse = await fetch(`http://localhost:5002/api/sondages/teacher/${matricule}`);
                if (!sondagesResponse.ok) {
                    const errorData = await sondagesResponse.json();
                    throw new Error(errorData.error || 'Erreur lors du chargement des sondages');
                }
                const sondagesData = await sondagesResponse.json();
                setTeacherSondages(Array.isArray(sondagesData) ? sondagesData : []);
                setFilteredTeacherSondages(Array.isArray(sondagesData) ? sondagesData : []);

                // Récupérer les sections et groupes associés à l'enseignant
                const sectionsResponse = await fetch(`http://localhost:5002/api/annonces/sections/${matricule}`);
                if (!sectionsResponse.ok) {
                    const errorData = await sectionsResponse.json();
                    throw new Error(errorData.error || 'Erreur lors du chargement des sections');
                }
                const sectionsData = await sectionsResponse.json();
                setSections(Array.isArray(sectionsData) ? sectionsData : []);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (matricule) {
            fetchData();
        } else {
            setError('Matricule non fourni');
            setLoading(false);
        }
    }, [matricule]);

    // Filtrer les annonces et sondages en fonction de la recherche
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAdminAnnonces(adminAnnonces);
            setFilteredTeacherAnnonces(teacherAnnonces);
            setFilteredTeacherSondages(teacherSondages);
        } else {
            const filteredAdmin = adminAnnonces.filter(annonce =>
                (annonce.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (annonce.content || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            const filteredTeacher = teacherAnnonces.filter(annonce =>
                (annonce.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (annonce.content || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            const filteredSondages = teacherSondages.filter(sondage =>
                (sondage.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (sondage.question || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAdminAnnonces(filteredAdmin);
            setFilteredTeacherAnnonces(filteredTeacher);
            setFilteredTeacherSondages(filteredSondages);
        }
    }, [searchTerm, adminAnnonces, teacherAnnonces, teacherSondages]);

    // Fonction pour parser le target_filter
    const parseTargetFilter = (targetFilter) => {
        try {
            if (typeof targetFilter === 'string' && targetFilter.trim() !== '') {
                const parsed = JSON.parse(targetFilter);
                return {
                    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
                    groupes: parsed.groupes && typeof parsed.groupes === 'object' ? parsed.groupes : {}
                };
            } else if (typeof targetFilter === 'object' && targetFilter !== null) {
                return {
                    sections: Array.isArray(targetFilter.sections) ? targetFilter.sections : [],
                    groupes: targetFilter.groupes && typeof targetFilter.groupes === 'object' ? targetFilter.groupes : {}
                };
            }
            return { sections: [], groupes: {} };
        } catch (error) {
            console.error('Erreur lors du parsing de target_filter:', error, 'Valeur:', targetFilter);
            return { sections: [], groupes: {} };
        }
    };

    // Fonction pour obtenir les noms des sections et groupes ciblés
    const getSectionNames = (sectionIds, groupeData) => {
        if (!sectionIds || sectionIds.length === 0) {
            return 'Aucune section';
        }
        const sectionNames = sectionIds.map(id => {
            const section = sections.find(s => s.ID_section === parseInt(id));
            if (!section) {
                console.log(`Section non trouvée pour ID_section: ${id}`);
                return null;
            }

            const groupesForSection = groupeData[id] || [];
            const groupeNames = groupesForSection.length > 0 && groupesForSection[0] !== ''
                ? groupesForSection.map(groupeId => {
                    const groupe = section.groupes.find(g => g.ID_groupe === parseInt(groupeId));
                    if (!groupe) {
                        console.log(`Groupe non trouvé pour ID_groupe: ${groupeId} dans la section ${id}`);
                        return null;
                    }
                    return groupe.nom_groupe;
                }).filter(name => name !== null).join(', ')
                : 'Tous les groupes';

            return `${section.niveau} - ${section.nom_specialite} (${groupeNames})`;
        }).filter(name => name !== null);
        return sectionNames.length > 0 ? sectionNames.join('; ') : 'Aucune section';
    };

    // Gestion des changements de sections
    const handleSectionChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selected = selectedOptions.map(opt => opt.value);
        setSelectedSections(selected);
        const newSelectedGroups = {};
        selected.forEach(sectionId => {
            if (selectedGroups[sectionId]) {
                newSelectedGroups[sectionId] = selectedGroups[sectionId];
            }
        });
        setSelectedGroups(newSelectedGroups);
    };

    // Gestion des changements de groupes
    const handleGroupChange = (sectionId, e) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selected = selectedOptions.map(opt => opt.value);
        setSelectedGroups(prev => ({
            ...prev,
            [sectionId]: selected
        }));
    };

    // Gestion des options de sondage
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    // Créer ou mettre à jour une annonce
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Le titre est requis');
            return;
        }
        if (!content.trim()) {
            setError('Le contenu est requis');
            return;
        }
        if (selectedSections.length === 0) {
            setError('Vous devez sélectionner au moins une section');
            return;
        }

        const data = {
            title,
            content,
            target_filter: {
                sections: selectedSections,
                groupes: selectedGroups
            },
            matricule
        };
        if (currentAnnonce) {
            data.id = currentAnnonce.id;
        }

        const url = currentAnnonce
            ? `http://localhost:5002/api/annonces/${currentAnnonce.id}`
            : 'http://localhost:5002/api/annonces';
        const method = currentAnnonce ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création/modification de l\'annonce');
            }

            const res = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erreur lors du rafraîchissement des annonces');
            }
            const updatedData = await res.json();
            setTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
            setFilteredTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
            setShowModal(false);
            setTitle('');
            setContent('');
            setSelectedSections([]);
            setSelectedGroups({});
            setCurrentAnnonce(null);
        } catch (err) {
            console.error('Erreur dans handleCreateOrUpdate:', err);
            setError(err.message);
        }
    };

    // Créer ou mettre à jour un sondage
    const handleCreateOrUpdateSondage = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Le titre est requis');
            return;
        }
        if (!question.trim()) {
            setError('La question est requise');
            return;
        }
        if (options.some(opt => !opt.trim())) {
            setError('Toutes les options doivent être remplies');
            return;
        }
        if (options.length < 2) {
            setError('Il doit y avoir au moins 2 options');
            return;
        }
        if (selectedSections.length === 0) {
            setError('Vous devez sélectionner au moins une section');
            return;
        }

        const data = {
            title,
            question,
            options,
            target_filter: {
                sections: selectedSections,
                groupes: selectedGroups
            },
            matricule
        };
        if (currentSondage) {
            data.id = currentSondage.id;
        }

        const url = currentSondage
            ? `http://localhost:5002/api/sondages/${currentSondage.id}`
            : 'http://localhost:5002/api/sondages';
        const method = currentSondage ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la création/modification du sondage');
            }

            const res = await fetch(`http://localhost:5002/api/sondages/teacher/${matricule}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erreur lors du rafraîchissement des sondages');
            }
            const updatedData = await res.json();
            setTeacherSondages(Array.isArray(updatedData) ? updatedData : []);
            setFilteredTeacherSondages(Array.isArray(updatedData) ? updatedData : []);
            setShowSondageModal(false);
            setTitle('');
            setQuestion('');
            setOptions(['', '']);
            setSelectedSections([]);
            setSelectedGroups({});
            setCurrentSondage(null);
        } catch (err) {
            console.error('Erreur dans handleCreateOrUpdateSondage:', err);
            setError(err.message);
        }
    };

    // Confirmer la suppression d'une annonce ou d'un sondage
    const confirmDelete = (id) => {
        setAnnonceToDelete(id);
        setShowConfirmModal(true);
    };

    const confirmDeleteSondage = (id) => {
        setAnnonceToDelete(id);
        setShowConfirmModal(true);
    };

    // Supprimer une annonce ou un sondage
    const handleDelete = async () => {
        const id = annonceToDelete;
        try {
            const isSondage = activeTab === 'sondages';
            const url = isSondage
                ? `http://localhost:5002/api/sondages/${id}`
                : `http://localhost:5002/api/annonces/${id}`;
            const refreshUrl = isSondage
                ? `http://localhost:5002/api/sondages/teacher/${matricule}`
                : `http://localhost:5002/api/annonces/teacher/${matricule}`;
            const setDataFunction = isSondage ? setTeacherSondages : setTeacherAnnonces;
            const setFilteredDataFunction = isSondage ? setFilteredTeacherSondages : setFilteredTeacherAnnonces;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricule })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur lors de la suppression de ${isSondage ? 'du sondage' : 'l\'annonce'}`);
            }

            const res = await fetch(refreshUrl);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Erreur lors du rafraîchissement des ${isSondage ? 'sondages' : 'annonces'}`);
            }
            const updatedData = await res.json();
            setDataFunction(Array.isArray(updatedData) ? updatedData : []);
            setFilteredDataFunction(Array.isArray(updatedData) ? updatedData : []);

            setShowConfirmModal(false);
            setAnnonceToDelete(null);
        } catch (err) {
            console.error('Erreur dans handleDelete:', err);
            setError(err.message);
            setShowConfirmModal(false);
            setAnnonceToDelete(null);
        }
    };

    // Ouvrir la modale de création/modification d'une annonce
    const openModal = (annonce = null) => {
        setCurrentAnnonce(annonce);
        if (annonce) {
            setTitle(annonce.title || '');
            setContent(annonce.content || '');
            const { sections, groupes } = parseTargetFilter(annonce.target_filter);
            setSelectedSections(sections);
            setSelectedGroups(groupes);
        } else {
            setTitle('');
            setContent('');
            setSelectedSections([]);
            setSelectedGroups({});
        }
        setShowModal(true);
    };

    // Ouvrir la modale de création/modification d'un sondage
    const openSondageModal = (sondage = null) => {
        setCurrentSondage(sondage);
        try {
            if (sondage) {
                setTitle(sondage.title || '');
                setQuestion(sondage.question || '');
                let parsedOptions = ['', ''];
                if (typeof sondage.options === 'string') {
                    parsedOptions = JSON.parse(sondage.options);
                } else if (Array.isArray(sondage.options)) {
                    parsedOptions = sondage.options;
                }
                setOptions(parsedOptions.length >= 2 ? parsedOptions : ['', '']);
                const { sections, groupes } = parseTargetFilter(sondage.target_filter);
                setSelectedSections(sections);
                setSelectedGroups(groupes);
            } else {
                setTitle('');
                setQuestion('');
                setOptions(['', '']);
                setSelectedSections([]);
                setSelectedGroups({});
            }
            setShowSondageModal(true);
        } catch (error) {
            console.error('Erreur lors de l\'ouverture de la modale de modification:', error);
            setError('Erreur lors du chargement des données du sondage');
            setShowSondageModal(true);
        }
    };

    // Ouvrir la modale de détails d'une annonce (avec récupération des commentaires si nécessaire)
    const openDetailsModal = async (annonce) => {
        setSelectedAnnonce(annonce);
        setShowDetailsModal(true);

        if (activeTab === 'gerer') {
            try {
                const response = await fetch(`http://localhost:5002/api/annonces/comments/${annonce.id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Erreur lors de la récupération des commentaires.');
                }
                const commentsData = await response.json();
                setComments(commentsData);
            } catch (err) {
                console.error('Erreur lors de la récupération des commentaires:', err);
                setError(err.message);
            }
        }
    };

    // Ouvrir la modale de détails d'un sondage
    const openSondageDetailsModal = (sondage) => {
        setSelectedSondage(sondage);
        setShowDetailsModal(true);
    };

    // Ouvrir la modale des résultats d'un sondage
    const openSondageResultsModal = async (sondage) => {
        try {
            const response = await fetch(`http://localhost:5002/api/sondages/${sondage.id}/results`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la récupération des résultats');
            }
            const data = await response.json();
            setSondageResults(data);
            setShowSondageResultsModal(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des résultats:', err);
            setError(err.message);
        }
    };

    // Fermer toutes les modales et réinitialiser les états
    const closeModal = () => {
        setShowModal(false);
        setShowDetailsModal(false);
        setShowConfirmModal(false);
        setShowSondageModal(false);
        setShowSondageResultsModal(false);
        setSelectedAnnonce(null);
        setSelectedSondage(null);
        setSondageResults(null);
        setCurrentAnnonce(null);
        setCurrentSondage(null);
        setAnnonceToDelete(null);
        setComments([]);
        setNewReplies({});
        setError('');
    };

    // Soumettre une réponse à un commentaire
    const handleReplySubmit = async (commentaireId) => {
        const reply = newReplies[commentaireId];
        if (!reply || !reply.trim()) {
            setError('Veuillez écrire une réponse avant de soumettre.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5002/api/annonces/comment/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commentaireId,
                    enseignantMatricule: matricule,
                    reponse: reply,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'envoi de votre réponse.');
            }

            // Rafraîchir les commentaires
            const commentsResponse = await fetch(`http://localhost:5002/api/annonces/comments/${selectedAnnonce.id}`);
            if (!commentsResponse.ok) {
                const errorData = await commentsResponse.json();
                throw new Error(errorData.error || 'Erreur lors du rafraîchissement des commentaires.');
            }
            const updatedComments = await commentsResponse.json();
            setComments(updatedComments);

            // Réinitialiser la réponse temporaire
            setNewReplies(prev => ({ ...prev, [commentaireId]: '' }));
        } catch (err) {
            console.error('Erreur lors de l\'envoi de la réponse:', err);
            setError(err.message);
        }
    };

    // Gestion de l'état de chargement
    if (loading) {
        return <div className="container">Chargement...</div>;
    }

    // Gestion des erreurs globales
    if (error && !showModal && !showSondageModal) {
        return (
            <div className="container">
                <p className="error-message">{error}</p>
                <button onClick={() => window.location.reload()}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="background-shapes">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
            </div>

            {/* Barre latérale */}
            <aside className="sidebar">
                <div className="logo">
                    <h2>Annonces</h2>
                </div>
                <button className="sidebar-button" onClick={handleLogout}>
                    <FaHome /> Retour à l'accueil
                </button>
                <button className="sidebar-button" onClick={() => setActiveTab('consulter')}>
                    <FaBullhorn /> Consulter les Annonces
                </button>
                <button className="sidebar-button" onClick={() => setActiveTab('gerer')}>
                    <FaPaperPlane /> Gérer mes Annonces
                </button>
                <button className="sidebar-button" onClick={() => setActiveTab('sondages')}>
                    <FaPoll /> Gérer mes Sondages
                </button>
            </aside>

            {/* Contenu principal */}
            <main className="main-content">
                {/* Onglet "Consulter les Annonces" */}
                {activeTab === 'consulter' && (
                    <section id="consulter" className="tab-content">
                        <div className="header">
                            <h1><FaUser /> Annonces Reçues</h1>
                            <p>Consultez les annonces destinées à vous de la part de l'administration</p>
                        </div>
                        <div className="search-bar-container">
                            <div className="search-bar">
                                <span className="search-icon"><FaSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Rechercher une annonce..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="event-list">
                            <ul id="annonces-list">
                                {filteredAdminAnnonces.length === 0 ? (
                                    <li className="no-results">Aucune annonce disponible</li>
                                ) : (
                                    filteredAdminAnnonces.map(annonce => (
                                        <li key={annonce.id} className="event-item" onClick={() => openDetailsModal(annonce)}>
                                            <div className="event-info">
                                                <h4>
                                                    <FaBullhorn className="annonce-icon" />
                                                    {annonce.title || 'Sans titre'}
                                                </h4>
                                                <p>{new Date(annonce.created_at).toLocaleString()}</p>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </section>
                )}

                {/* Onglet "Gérer mes Annonces" */}
                {activeTab === 'gerer' && (
                    <section id="gerer" className="tab-content">
                        <div className="header">
                            <h1><FaUser /> Gérer mes Annonces</h1>
                            <p>Créer, modifier ou supprimer des annonces pour vos étudiants</p>
                        </div>
                        <div className="event-list">
                            <button className="button create-button" onClick={() => openModal()}>
                                <FaPlus /> Créer une Annonce
                            </button>
                            <div className="search-bar-container">
                                <div className="search-bar">
                                    <span className="search-icon"><FaSearch /></span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher une annonce..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ul id="mes-annonces-list">
                                {filteredTeacherAnnonces.length === 0 ? (
                                    <li className="no-results">Aucune annonce disponible</li>
                                ) : (
                                    filteredTeacherAnnonces.map(annonce => (
                                        <li
                                            key={annonce.id}
                                            className="event-item"
                                            onClick={(e) => {
                                                if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                                                    openDetailsModal(annonce);
                                                }
                                            }}
                                        >
                                            <div className="event-info">
                                                <h4>
                                                    <FaBullhorn className="annonce-icon" />
                                                    {annonce.title || 'Sans titre'}
                                                </h4>
                                                <p>{new Date(annonce.created_at).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <button
                                                    className="edit-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModal(annonce);
                                                    }}
                                                >
                                                    <FaEdit /> Modifier
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDelete(annonce.id);
                                                    }}
                                                >
                                                    <FaTrash /> Supprimer
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </section>
                )}

                {/* Onglet "Gérer mes Sondages" */}
                {activeTab === 'sondages' && (
                    <section id="sondages" className="tab-content">
                        <div className="header">
                            <h1><FaPoll /> Gérer mes Sondages</h1>
                            <p>Créer et consulter les résultats des sondages pour vos étudiants</p>
                        </div>
                        <div className="event-list">
                            <button className="button create-button" onClick={() => openSondageModal()}>
                                <FaPlus /> Créer un Sondage
                            </button>
                            <div className="search-bar-container">
                                <div className="search-bar">
                                    <span className="search-icon"><FaSearch /></span>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un sondage..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ul id="mes-sondages-list">
                                {filteredTeacherSondages.length === 0 ? (
                                    <li className="no-results">Aucun sondage disponible</li>
                                ) : (
                                    filteredTeacherSondages.map(sondage => (
                                        <li
                                            key={sondage.id}
                                            className="event-item"
                                            // Suppression de l'événement onClick pour éviter l'ouverture de la modale
                                        >
                                            <div className="event-info">
                                                <h4>
                                                    <FaPoll className="annonce-icon" />
                                                    {sondage.title || 'Sans titre'}
                                                </h4>
                                                <p>{new Date(sondage.created_at).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <button
                                                    className="edit-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openSondageModal(sondage);
                                                    }}
                                                >
                                                    <FaEdit /> Modifier
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confirmDeleteSondage(sondage.id);
                                                    }}
                                                >
                                                    <FaTrash /> Supprimer
                                                </button>
                                                <button
                                                    className="edit-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openSondageResultsModal(sondage);
                                                    }}
                                                >
                                                    <FaPoll /> Voir les résultats
                                                </button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </section>
                )}
            </main>

            {/* Modale de création/modification d'une annonce */}
            {showModal && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>{currentAnnonce ? 'Modifier une Annonce' : 'Créer une Annonce'}</h3>
                        {error && <p className="error-message">{error}</p>}
                        <form onSubmit={handleCreateOrUpdate}>
                            <div className="input-group">
                                <label>Titre</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Contenu</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="filter-section">
                                <h4>Destinataires</h4>
                                <div className="filter-options">
                                    <div className="filter-group">
                                        <label>Sections</label>
                                        <select
                                            multiple
                                            value={selectedSections}
                                            onChange={handleSectionChange}
                                        >
                                            {sections.length === 0 ? (
                                                <option disabled>Aucune section disponible</option>
                                            ) : (
                                                sections.map(section => (
                                                    <option key={section.ID_section} value={String(section.ID_section)}>
                                                        {section.niveau} - {section.nom_specialite}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                    {selectedSections.map(sectionId => {
                                        const section = sections.find(s => s.ID_section === parseInt(sectionId));
                                        if (!section || !section.groupes || section.groupes.length === 0) return null;

                                        const uniqueGroupes = [];
                                        const seenNames = new Set();
                                        section.groupes.forEach(groupe => {
                                            if (!seenNames.has(groupe.nom_groupe)) {
                                                seenNames.add(groupe.nom_groupe);
                                                uniqueGroupes.push(groupe);
                                            }
                                        });

                                        return (
                                            <div key={sectionId} className="filter-group">
                                                <label>Groupes pour {section.niveau} - {section.nom_specialite}</label>
                                                <select
                                                    multiple
                                                    value={selectedGroups[sectionId] || []}
                                                    onChange={(e) => handleGroupChange(sectionId, e)}
                                                >
                                                    <option value="">Tous les groupes</option>
                                                    {uniqueGroupes.map(groupe => (
                                                        <option key={groupe.ID_groupe} value={String(groupe.ID_groupe)}>
                                                            {groupe.nom_groupe}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="submit"><FaPaperPlane /> Enregistrer</button>
                                <button type="button" className="close-button" onClick={closeModal}>
                                    <FaTimes /> Fermer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modale de création/modification d'un sondage */}
            {showSondageModal && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>{currentSondage ? 'Modifier un Sondage' : 'Créer un Sondage'}</h3>
                        {error && <p className="error-message">{error}</p>}
                        <form onSubmit={handleCreateOrUpdateSondage}>
                            <div className="input-group">
                                <label>Titre</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Question</label>
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Options</label>
                                {options.map((option, index) => (
                                    <div key={index} className="option-group">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            required
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                className="remove-option-button"
                                                onClick={() => removeOption(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="add-option-button" onClick={addOption}>
                                    <FaPlus /> Ajouter une option
                                </button>
                            </div>
                            <div className="filter-section">
                                <h4>Destinataires</h4>
                                <div className="filter-options">
                                    <div className="filter-group">
                                        <label>Sections</label>
                                        <select
                                            multiple
                                            value={selectedSections}
                                            onChange={handleSectionChange}
                                        >
                                            {sections.length === 0 ? (
                                                <option disabled>Aucune section disponible</option>
                                            ) : (
                                                sections.map(section => (
                                                    <option key={section.ID_section} value={String(section.ID_section)}>
                                                        {section.niveau} - {section.nom_specialite}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                    {selectedSections.map(sectionId => {
                                        const section = sections.find(s => s.ID_section === parseInt(sectionId));
                                        if (!section || !section.groupes || section.groupes.length === 0) return null;

                                        const uniqueGroupes = [];
                                        const seenNames = new Set();
                                        section.groupes.forEach(groupe => {
                                            if (!seenNames.has(groupe.nom_groupe)) {
                                                seenNames.add(groupe.nom_groupe);
                                                uniqueGroupes.push(groupe);
                                            }
                                        });

                                        return (
                                            <div key={sectionId} className="filter-group">
                                                <label>Groupes pour {section.niveau} - {section.nom_specialite}</label>
                                                <select
                                                    multiple
                                                    value={selectedGroups[sectionId] || []}
                                                    onChange={(e) => handleGroupChange(sectionId, e)}
                                                >
                                                    <option value="">Tous les groupes</option>
                                                    {uniqueGroupes.map(groupe => (
                                                        <option key={groupe.ID_groupe} value={String(groupe.ID_groupe)}>
                                                            {groupe.nom_groupe}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="button-group">
                                <button type="submit"><FaPaperPlane /> Enregistrer</button>
                                <button type="button" className="close-button" onClick={closeModal}>
                                    <FaTimes /> Fermer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modale de détails d'une annonce */}
            {showDetailsModal && selectedAnnonce && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>{selectedAnnonce.title || 'Sans titre'}</h3>
                        <div className="modal-body">
                            {activeTab === 'consulter' && selectedAnnonce.image_url ? (
                                <img
                                    src={selectedAnnonce.image_url}
                                    alt={selectedAnnonce.title}
                                    className="event-image"
                                    onError={(e) => {
                                        e.target.src = '';
                                        console.error('Erreur chargement image :', e.target.src);
                                    }}
                                />
                            ) : activeTab === 'consulter' ? (
                                <div className="image-placeholder">Aucune image</div>
                            ) : null}
                            <div className="description">
                                <p><strong>Contenu :</strong> {selectedAnnonce.content || 'Aucun contenu'}</p>
                            </div>
                            <p><strong>Date de création :</strong> {new Date(selectedAnnonce.created_at).toLocaleString()}</p>
                            {activeTab === 'gerer' && (
                                <p>
                                    <strong>Destinataires :</strong>{' '}
                                    {(() => {
                                        const { sections, groupes } = parseTargetFilter(selectedAnnonce.target_filter);
                                        return getSectionNames(sections, groupes);
                                    })()}
                                </p>
                            )}

                            {/* Section des commentaires (uniquement dans l'onglet "Gérer mes Annonces") */}
                            {activeTab === 'gerer' && (
                                <div className="comments-section" style={{ marginTop: '20px' }}>
                                    <h4 style={{
                                        marginBottom: '15px',
                                        color: '#052659',
                                        fontSize: '1.3rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderBottom: '2px solid #e6f0ff',
                                        paddingBottom: '5px'
                                    }}>
                                        <FaComment style={{ marginRight: '8px', color: '#5483b3' }} /> Commentaires
                                    </h4>

                                    {comments.length === 0 ? (
                                        <p style={{
                                            color: '#5483b3',
                                            fontStyle: 'italic',
                                            backgroundColor: '#f0f7ff',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            Aucun commentaire pour le moment.
                                        </p>
                                    ) : (
                                        <div className="comments-list" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                                            {comments.map(comment => (
                                                <div key={comment.ID_commentaire} className="comment-item" style={{
                                                    backgroundColor: '#fff',
                                                    borderRadius: '10px',
                                                    padding: '15px',
                                                    marginBottom: '15px',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    borderLeft: '4px solid #5483b3',
                                                    transition: 'transform 0.2s ease',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <p style={{
                                                            margin: 0,
                                                            fontWeight: 'bold',
                                                            color: '#052659',
                                                            fontSize: '1rem'
                                                        }}>
                                                            {comment.nom} {comment.prenom}
                                                        </p>
                                                        <p style={{
                                                            margin: 0,
                                                            color: '#5483b3',
                                                            fontSize: '0.85rem',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            {new Date(comment.date_commentaire).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <p style={{
                                                        margin: '0 0 10px 0',
                                                        color: '#333',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {comment.contenu}
                                                    </p>
                                                    {comment.reponse_enseignant ? (
                                                        <div className="teacher-reply" style={{
                                                            backgroundColor: '#f0f7ff',
                                                            borderRadius: '8px',
                                                            padding: '10px',
                                                            marginTop: '10px',
                                                            borderLeft: '3px solid #052659'
                                                        }}>
                                                            <p style={{
                                                                margin: '0 0 5px 0',
                                                                fontWeight: 'bold',
                                                                color: '#052659',
                                                                fontSize: '0.9rem',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <FaUserTie style={{ marginRight: '6px', color: '#5483b3' }} />
                                                                Réponse de l'enseignant
                                                                <span style={{
                                                                    marginLeft: '10px',
                                                                    color: '#5483b3',
                                                                    fontSize: '0.85rem',
                                                                    fontStyle: 'italic',
                                                                    fontWeight: 'normal'
                                                                }}>
                                                                    ({new Date(comment.date_reponse).toLocaleString()})
                                                                </span>
                                                            </p>
                                                            <p style={{
                                                                margin: 0,
                                                                color: '#052659',
                                                                fontSize: '0.9rem',
                                                                fontStyle: 'italic',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                {comment.reponse_enseignant}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="reply-form" style={{
                                                            marginTop: '10px',
                                                            backgroundColor: '#f9f9f9',
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
                                                        }}>
                                                            <textarea
                                                                placeholder="Votre réponse..."
                                                                value={newReplies[comment.ID_commentaire] || ''}
                                                                onChange={(e) =>
                                                                    setNewReplies(prev => ({
                                                                        ...prev,
                                                                        [comment.ID_commentaire]: e.target.value
                                                                    }))
                                                                }
                                                                style={{
                                                                    width: '100%',
                                                                    minHeight: '60px',
                                                                    padding: '8px',
                                                                    borderRadius: '5px',
                                                                    border: '1px solid #ddd',
                                                                    fontSize: '0.9rem',
                                                                    resize: 'vertical',
                                                                    marginBottom: '8px',
                                                                    outline: 'none',
                                                                    transition: 'border-color 0.2s ease',
                                                                    boxSizing: 'border-box'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#5483b3'}
                                                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                                            />
                                                            <button
                                                                onClick={() => handleReplySubmit(comment.ID_commentaire)}
                                                                style={{
                                                                    backgroundColor: '#052659',
                                                                    color: '#fff',
                                                                    padding: '8px 15px',
                                                                    borderRadius: '5px',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.9rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'background-color 0.2s ease'
                                                                }}
                                                                onMouseOver={(e) => e.target.style.backgroundColor = '#5483b3'}
                                                                onMouseOut={(e) => e.target.style.backgroundColor = '#052659'}
                                                            >
                                                                <FaPaperPlane style={{ marginRight: '5px' }} /> Répondre
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="button-group">
                            <button className="close-button" onClick={closeModal}>
                                <FaTimes /> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale de détails d'un sondage */}
            {showDetailsModal && selectedSondage && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>{selectedSondage.title || 'Sans titre'}</h3>
                        <div className="modal-body">
                            <p><strong>Question :</strong> {selectedSondage.question || 'Aucune question'}</p>
                            <p><strong>Options :</strong> {JSON.parse(selectedSondage.options).join(', ')}</p>
                            <p><strong>Date de création :</strong> {new Date(selectedSondage.created_at).toLocaleString()}</p>
                            <p>
                                <strong>Destinataires :</strong>{' '}
                                {(() => {
                                    const { sections, groupes } = parseTargetFilter(selectedSondage.target_filter);
                                    return getSectionNames(sections, groupes);
                                })()}
                            </p>
                        </div>
                        <div className="button-group">
                            <button className="close-button" onClick={closeModal}>
                                <FaTimes /> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale des résultats d'un sondage */}
            {showSondageResultsModal && sondageResults && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>Résultats du Sondage: {sondageResults.sondage.title}</h3>
                        <div className="modal-body">
                            <p><strong>Question :</strong> {sondageResults.sondage.question}</p>
                            <h4>Résultats :</h4>
                            <div className="sondage-results">
                                {sondageResults.resultats.length === 0 ? (
                                    <p className="no-votes">Aucun vote pour le moment.</p>
                                ) : (
                                    <>
                                        {(() => {
                                            const totalVotes = sondageResults.resultats.reduce((sum, r) => sum + r.count, 0);
                                            const maxVotes = Math.max(...sondageResults.resultats.map(r => r.count));
                                            return sondageResults.resultats.map((result, index) => {
                                                const percentage = totalVotes > 0 ? (result.count / totalVotes) * 100 : 0;
                                                const isMostVoted = result.count === maxVotes && result.count > 0;
                                                return (
                                                    <div key={index} className="result-item">
                                                        <div className="result-header">
                                                            <span className="result-option">
                                                                {result.option}
                                                                {isMostVoted && (
                                                                    <span className="most-voted-icon" title="Option la plus votée">
                                                                        <FaStar />
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="result-stats">
                                                                {result.count} vote(s) ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="result-bar">
                                                            <div
                                                                className={`result-bar-fill option-${index % 5}`}
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <span className="result-bar-label">
                                                                    {percentage.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                        <p className="total-votes">
                                            Total des votes : {sondageResults.resultats.reduce((sum, r) => sum + r.count, 0)}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="button-group">
                            <button className="close-button" onClick={closeModal}>
                                <FaTimes /> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale de confirmation de suppression */}
            {showConfirmModal && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <h3>Confirmer la Suppression</h3>
                        <div className="modal-body">
                            <p>Êtes-vous sûr de vouloir supprimer {activeTab === 'sondages' ? 'ce sondage' : 'cette annonce'} ? Cette action est irréversible.</p>
                        </div>
                        <div className="button-group">
                            <button className="delete-button" onClick={handleDelete}>
                                <FaTrash /> Oui, Supprimer
                            </button>
                            <button className="close-button" onClick={closeModal}>
                                <FaTimes /> Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnonceENS;
