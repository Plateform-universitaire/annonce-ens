// frontend/src/components/AnnonceENS.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUser, FaPaperPlane, FaBullhorn, FaSearch, FaHome } from 'react-icons/fa';
import '../styles.css';

const AnnonceENS = ({ matricule, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('consulter');
  const [adminAnnonces, setAdminAnnonces] = useState([]);
  const [filteredAdminAnnonces, setFilteredAdminAnnonces] = useState([]);
  const [teacherAnnonces, setTeacherAnnonces] = useState([]);
  const [filteredTeacherAnnonces, setFilteredTeacherAnnonces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [annonceToDelete, setAnnonceToDelete] = useState(null);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [currentAnnonce, setCurrentAnnonce] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSections, setSelectedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching admin annonces for matricule:', matricule);
        const adminResponse = await fetch(`http://localhost:5002/api/annonces/admin/${matricule}`);
        if (!adminResponse.ok) {
          const errorData = await adminResponse.json();
          throw new Error(errorData.error || 'Erreur lors du chargement des annonces admin');
        }
        const adminData = await adminResponse.json();
        console.log('Admin annonces:', adminData);
        setAdminAnnonces(Array.isArray(adminData) ? adminData : []);
        setFilteredAdminAnnonces(Array.isArray(adminData) ? adminData : []);

        console.log('Fetching teacher annonces for matricule:', matricule);
        const teacherResponse = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
        if (!teacherResponse.ok) {
          const errorData = await teacherResponse.json();
          throw new Error(errorData.error || 'Erreur lors du chargement des annonces enseignant');
        }
        const teacherData = await teacherResponse.json();
        console.log('Teacher annonces:', teacherData);
        setTeacherAnnonces(Array.isArray(teacherData) ? teacherData : []);
        setFilteredTeacherAnnonces(Array.isArray(teacherData) ? teacherData : []);

        console.log('Fetching sections for matricule:', matricule);
        const sectionsResponse = await fetch(`http://localhost:5002/api/annonces/sections/${matricule}`);
        if (!sectionsResponse.ok) {
          const errorData = await sectionsResponse.json();
          throw new Error(errorData.error || 'Erreur lors du chargement des sections');
        }
        const sectionsData = await sectionsResponse.json();
        console.log('Sections:', sectionsData);
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

  useEffect(() => {
    console.log("Admin annonces:", adminAnnonces);
    console.log("Filtered admin annonces:", filteredAdminAnnonces);
    console.log("Teacher annonces:", teacherAnnonces);
    console.log("Filtered teacher annonces:", filteredTeacherAnnonces);
    if (searchTerm.trim() === '') {
      setFilteredAdminAnnonces(adminAnnonces);
      setFilteredTeacherAnnonces(teacherAnnonces);
    } else {
      const filteredAdmin = adminAnnonces.filter(annonce =>
        (annonce.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (annonce.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      const filteredTeacher = teacherAnnonces.filter(annonce =>
        (annonce.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (annonce.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdminAnnonces(filteredAdmin);
      setFilteredTeacherAnnonces(filteredTeacher);
    }
  }, [searchTerm, adminAnnonces, teacherAnnonces]);

  const parseTargetFilter = (targetFilter) => {
    try {
      if (typeof targetFilter === 'string' && targetFilter.trim() !== '') {
        const parsed = JSON.parse(targetFilter);
        return parsed.sections || [];
      } else if (typeof targetFilter === 'object' && targetFilter !== null) {
        return targetFilter.sections || [];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors du parsing de target_filter:', error, 'Valeur:', targetFilter);
      return [];
    }
  };

  const getSectionNames = (sectionIds) => {
    if (!sectionIds || sectionIds.length === 0) {
      return 'Aucune section';
    }
    const sectionNames = sectionIds.map(id => {
      const section = sections.find(s => s.ID_section === parseInt(id));
      return section ? `${section.niveau} - ${section.nom_specialite}` : null;
    }).filter(name => name !== null);
    return sectionNames.length > 0 ? sectionNames.join(', ') : 'Aucune section';
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    console.log("handleCreateOrUpdate appelé avec data:", { title, content, sections: selectedSections, matricule });
    const data = { title, content, sections: selectedSections, matricule };
    if (currentAnnonce) {
      data.id = currentAnnonce.id;
    }

    const url = currentAnnonce
      ? `http://localhost:5002/api/annonces/${currentAnnonce.id}`
      : 'http://localhost:5002/api/annonces';
    const method = currentAnnonce ? 'PUT' : 'POST';

    try {
      console.log(`Envoi de la requête ${method} à ${url}`);
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création/modification de l\'annonce');
      }

      console.log('Annonce créée/modifiée avec succès, rafraîchissement des annonces...');
      const res = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors du rafraîchissement des annonces');
      }
      const updatedData = await res.json();
      console.log('Données mises à jour:', updatedData);
      setTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
      setFilteredTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
      setShowModal(false);
      setTitle('');
      setContent('');
      setSelectedSections([]);
      setCurrentAnnonce(null);
    } catch (err) {
      console.error('Erreur dans handleCreateOrUpdate:', err);
      setError(err.message);
    }
  };

  const confirmDelete = (id) => {
    console.log("Confirmation de suppression pour annonce ID:", id);
    setAnnonceToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    const id = annonceToDelete;
    console.log("handleDelete appelé pour annonce ID:", id);
    console.log("Matricule envoyé:", matricule);
    try {
      const annonce = teacherAnnonces.find(a => a.id === id);
      console.log("Annonce à supprimer:", annonce);

      const response = await fetch(`http://localhost:5002/api/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule })
      });

      console.log("Requête envoyée:", {
        url: `http://localhost:5002/api/annonces/${id}`,
        method: 'DELETE',
        body: { matricule }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur lors de la suppression:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'annonce');
      }

      const responseData = await response.json();
      console.log('Réponse de l\'API de suppression:', responseData);

      console.log('Rafraîchissement des annonces après suppression...');
      const res = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Erreur lors du rafraîchissement:', errorData);
        throw new Error(errorData.error || 'Erreur lors du rafraîchissement des annonces');
      }
      const updatedData = await res.json();
      console.log('Données mises à jour après suppression:', updatedData);
      setTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
      setFilteredTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);

      setShowConfirmModal(false);
      setAnnonceToDelete(null);
    } catch (err) {
      console.error('Erreur dans handleDelete:', err);
      setError(err.message);
      setShowConfirmModal(false);
      setAnnonceToDelete(null);
    }
  };

  const openModal = (annonce = null) => {
    console.log("Ouverture de la modale pour annonce:", annonce);
    setCurrentAnnonce(annonce);
    if (annonce) {
      setTitle(annonce.title || '');
      setContent(annonce.content || '');
      const sections = parseTargetFilter(annonce.target_filter);
      setSelectedSections(sections);
    } else {
      setTitle('');
      setContent('');
      setSelectedSections([]);
    }
    setShowModal(true);
  };

  const openDetailsModal = (annonce) => {
    console.log("Ouverture de la modale de détails pour annonce:", annonce);
    setSelectedAnnonce(annonce);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    console.log("Fermeture de la modale");
    setShowModal(false);
    setShowDetailsModal(false);
    setShowConfirmModal(false);
    setSelectedAnnonce(null);
    setCurrentAnnonce(null);
    setAnnonceToDelete(null);
  };

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  if (error) {
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

      <aside className="sidebar">
        <div className="logo">
          <h2>Annonces</h2>
        </div>
        <button
          className="sidebar-button"
          onClick={() => {
            console.log("Retour à l'accueil cliqué, appel de handleLogout");
            handleLogout();
          }}
        >
          <FaHome /> Retour à l'accueil
        </button>
        <button className="sidebar-button" onClick={() => setActiveTab('consulter')}>
          <FaBullhorn /> Consulter les Annonces
        </button>
        <button className="sidebar-button" onClick={() => setActiveTab('gerer')}>
          <FaPaperPlane /> Gérer mes Annonces
        </button>
      </aside>

      <main className="main-content">
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
                  onChange={(e) => {
                    console.log("Recherche:", e.target.value);
                    setSearchTerm(e.target.value);
                  }}
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

        {activeTab === 'gerer' && (
          <section id="gerer" className="tab-content">
            <div className="header">
              <h1><FaUser /> Gérer mes Annonces</h1>
              <p>Créer, modifier ou supprimer des annonces pour vos étudiants</p>
            </div>
            <div className="event-list">
              <button
                className="button create-button"
                onClick={() => {
                  console.log("Créer une Annonce cliqué");
                  openModal();
                }}
              >
                <FaPlus /> Créer une Annonce
              </button>
              <div className="search-bar-container">
                <div className="search-bar">
                  <span className="search-icon"><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Rechercher une annonce..."
                    value={searchTerm}
                    onChange={(e) => {
                      console.log("Recherche:", e.target.value);
                      setSearchTerm(e.target.value);
                    }}
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
                          onClick={() => {
                            console.log("Modifier cliqué pour annonce:", annonce.id);
                            openModal(annonce);
                          }}
                        >
                          <FaEdit /> Modifier
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => {
                            console.log("Supprimer cliqué pour annonce:", annonce.id);
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
      </main>

      {showModal && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h3>{currentAnnonce ? 'Modifier une Annonce' : 'Créer une Annonce'}</h3>
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
                      onChange={(e) => setSelectedSections([...e.target.selectedOptions].map(opt => opt.value))}
                      required
                    >
                      {sections.length === 0 ? (
                        <option disabled>Aucune section disponible</option>
                      ) : (
                        sections.map(section => (
                          <option key={section.ID_section} value={section.ID_section}>
                            {section.niveau} - {section.nom_specialite}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
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
                  {getSectionNames(parseTargetFilter(selectedAnnonce.target_filter))}
                </p>
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

      {showConfirmModal && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h3>Confirmer la Suppression</h3>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.</p>
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
