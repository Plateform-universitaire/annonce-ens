import React, { useState, useEffect } from 'react';

const AnnonceENS = ({ matricule, handleLogout }) => {
  const [activeTab, setActiveTab] = useState('consulter');
  const [adminAnnonces, setAdminAnnonces] = useState([]);
  const [teacherAnnonces, setTeacherAnnonces] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

        console.log('Fetching teacher annonces for matricule:', matricule);
        const teacherResponse = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
        if (!teacherResponse.ok) {
          const errorData = await teacherResponse.json();
          throw new Error(errorData.error || 'Erreur lors du chargement des annonces enseignant');
        }
        const teacherData = await teacherResponse.json();
        console.log('Teacher annonces:', teacherData);
        setTeacherAnnonces(Array.isArray(teacherData) ? teacherData : []);

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

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const data = { title, content, sections: selectedSections, matricule };
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
      setShowModal(false);
      setTitle('');
      setContent('');
      setSelectedSections([]);
      setCurrentAnnonce(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5002/api/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricule })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'annonce');
      }

      const res = await fetch(`http://localhost:5002/api/annonces/teacher/${matricule}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors du rafraîchissement des annonces');
      }
      const updatedData = await res.json();
      setTeacherAnnonces(Array.isArray(updatedData) ? updatedData : []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    }
  };

  const openModal = (annonce = null) => {
    setCurrentAnnonce(annonce);
    if (annonce) {
      setTitle(annonce.title || '');
      setContent(annonce.content || '');
      setSelectedSections(annonce.target_filter?.sections || []);
    } else {
      setTitle('');
      setContent('');
      setSelectedSections([]);
    }
    setShowModal(true);
  };

  const openDetailsModal = (annonce) => {
    setSelectedAnnonce(annonce);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAnnonce(null);
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
      <aside className="sidebar">
        <div className="logo">
          <h2>Annonces</h2>
        </div>
        <button className="sidebar-button" onClick={() => setActiveTab('consulter')}>
          Consulter les Annonces
        </button>
        <button className="sidebar-button" onClick={() => setActiveTab('gerer')}>
          Gérer mes Annonces
        </button>
        <button className="sidebar-button" onClick={handleLogout} style={{ marginTop: 'auto' }}>
          Déconnexion
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'consulter' && (
          <section id="consulter" className="tab-content">
            <div className="header">
              <h1>Annonces Reçues</h1>
              <p>Consultez les annonces destinées à vous de la part de l'administration</p>
            </div>
            <div className="content-grid">
              <div className="event-list">
                <ul id="annonces-list">
                  {adminAnnonces.length === 0 ? (
                    <li className="no-results">Aucune annonce disponible</li>
                  ) : (
                    adminAnnonces.map(annonce => (
                      <li key={annonce.id} className="event-item" onClick={() => openDetailsModal(annonce)}>
                        <div className="event-info">
                          <h4>{annonce.title || 'Sans titre'}</h4>
                          <p>{new Date(annonce.created_at).toLocaleString()}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'gerer' && (
          <section id="gerer" className="tab-content">
            <div className="header">
              <h1>Gérer mes Annonces</h1>
              <p>Créer, modifier ou supprimer des annonces pour vos étudiants</p>
            </div>
            <div className="content-grid">
              <div className="chart-container">
                <button className="button" onClick={() => openModal()}>
                  Créer une Annonce
                </button>
                <ul id="mes-annonces-list">
                  {teacherAnnonces.length === 0 ? (
                    <li className="no-results">Aucune annonce disponible</li>
                  ) : (
                    teacherAnnonces.map(annonce => (
                      <li key={annonce.id} className="event-item">
                        <div className="event-info">
                          <h4>{annonce.title || 'Sans titre'}</h4>
                          <p>{new Date(annonce.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <button className="edit-button" onClick={() => openModal(annonce)}>
                            Modifier
                          </button>
                          <button className="delete-button" onClick={() => handleDelete(annonce.id)}>
                            Supprimer
                          </button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
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
                <button type="submit">Enregistrer</button>
                <button type="button" className="close-button" onClick={() => setShowModal(false)}>
                  Fermer
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
              {selectedAnnonce.image_url ? (
                <img
                  src={selectedAnnonce.image_url}
                  alt={selectedAnnonce.title}
                  className="event-image"
                  style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }}
                  onError={(e) => {
                    e.target.src = '';
                    console.error('Erreur chargement image :', e.target.src);
                  }}
                />
              ) : (
                <div className="image-placeholder">Aucune image</div>
              )}
              <p><strong>Contenu :</strong> {selectedAnnonce.content || 'Aucun contenu'}</p>
              <p><strong>Date de création :</strong> {new Date(selectedAnnonce.created_at).toLocaleString()}</p>
              {/* Suppression de la ligne affichant "Événement associé : ID X" */}
            </div>
            <div className="button-group">
              <button className="close-button" onClick={closeDetailsModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnonceENS;