import { Button, Row, Col } from "react-bootstrap";

function Header(){
    return (      
    <header className="mb-4 p-4 bg-primary text-white rounded shadow-sm">
        <Row>
          <Col>
            <h1 className="h3">🎓 StudyPlan</h1>
          </Col>
          <Col className='text-end'>
            <Button className='bg-light text-black'>Login</Button>
          </Col>
        </Row>

      </header>)
}

export {Header};