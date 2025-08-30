import 'swiper/css';
import 'swiper/css/autoplay';
import Routing from './Routing';
import { LanguageProvider } from './context/LanguageContext';

const App = () => {
  return (
    <LanguageProvider>
      <div>
        <Routing />
      </div>
    </LanguageProvider>
  );
};

export default App;