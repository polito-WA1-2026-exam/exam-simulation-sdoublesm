import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css"
import { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Container, Spinner, Alert, Card, Row, Col, Button, Collapse, Badge } from 'react-bootstrap';
import { getCourses } from "./api/api.js";
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stato per tenere traccia di quali corsi sono espansi (mappa di booleani)
  // Esempio: { "02GOLOV": true, "01TXYOV": false }
  const [expandedCourses, setExpandedCourses] = useState({});

  // Inverte lo stato di espansione per il corso selezionato
  const toggleExpand = (courseCode) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseCode]: !prev[courseCode]
    }));
  };

  useEffect(() => {
    async function fetchInitialCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError("Impossibile recuperare l'elenco dei corsi. Riprova più tardi.", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialCourses();
  }, []);

  return (
    <Container className="mt-4">
      <Header />
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Caricamento corsi...</span>
          </Spinner>
        </div>
      ) : (
        <Row className="g-3">
          {courses.map((course) => {
            const isExpanded = !!expandedCourses[course.code];

            return (
              <Col xs={12} key={course.code}>
                <Card className="shadow-sm border-start border-1 border-primary">
                  <Card.Body>
                    {/* Intestazione/Riga principale della card */}
                    <Row className="align-items-center text-center text-md-start g-2">
                      <Col md={1} className="">
                        <Button
                          variant=""
                          size="lg"
                          onClick={() => toggleExpand(course.code)}
                          aria-expanded={isExpanded}
                          className="d-flex align-items-center justify-content-center"
                        >
                          {isExpanded ? (
                            <i className="bi bi-caret-down"></i>
                          ) : (
                            <i className="bi bi-caret-right"></i>
                          )}
                        </Button>
                      </Col>
                      <Col md={2} className="fw-bold text-primary">
                         <Badge bg='info'>{course.code}</Badge>
                      </Col>
                      <Col md={5} className="fw-semibold">
                        {course.name}
                      </Col>
                      <Col md={2} className="text-secondary">
                        <Badge bg="secondary" className="px-2 py-1">{course.credits} CFU</Badge>
                      </Col>
                      <Col md={2} className="small text-muted">
                        <div>Iscritti: <strong>{course.enrolled}</strong></div>
                        {course.maxStudents ? (
                          <div className="text-danger">Max: {course.maxStudents}</div>
                        ) : (
                          <div className="text-success">Posti illimitati</div>
                        )}
                      </Col>
                    </Row>

                    {/* Contenuto espandibile (Vincoli del Corso) */}
                    <Collapse in={isExpanded}>
                      <div className="mt-3 pt-3 border-top bg-light p-3 rounded">
                        <Row className="g-3">
                          {/* Propedeuticità */}
                          <Col md={6}>
                            <div className="small fw-bold text-uppercase text-muted mb-1">
                              Propedeuticità Obbligatoria
                            </div>
                            {course.preparatoryCourse ? (
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg="" text="dark">{course.preparatoryCourse}</Badge>
                                <span className="small text-dark">
                                  {courses.find(c => c.code === course.preparatoryCourse)?.name || 'Corso propedeutico'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted small italic">Nessun corso preparatorio richiesto</span>
                            )}
                          </Col>

                          {/* Incompatibilità */}
                          <Col md={6}>
                            <div className="small fw-bold text-uppercase text-muted mb-1">
                              Corsi Incompatibili
                            </div>
                            {course.incompatible && course.incompatible.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1 align-items-center">
                                {course.incompatible.map((incCode) => (
                                  <Badge 
                                    key={incCode} 
                                    bg="danger" 
                                    title={courses.find(c => c.code === incCode)?.name || ''}
                                    style={{ cursor: 'help' }}
                                  >
                                    {incCode}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted small italic">Nessuna incompatibilità</span>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default App;