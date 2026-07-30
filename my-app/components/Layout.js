// my-app/components/Layout.js

import { Container } from 'react-bootstrap'
import MainNav from './MainNav'
import Footer from './Footer'

export default function Layout(props) {
    return (<> 
      <MainNav />
      <br />
      <Container class="my-4" style={{ minHeight: '950px' }}>
          {props.children}
      </Container>
      <br />
      <Footer/>
      </>)
    }