import './App.css';
import Dapp from './pages/Dapp';

export default function App() {

  return (
    <div className="App">
      <h1>ETHW Gnosis Safe Multisig Recovery</h1>
      <header>
        If you have a Gnosis Safe with some ETHW that you are trying to recover, this tool will help you.
        <br /><br />
        Firstly, you need to build up enough signatures depending on what your threshold is using the "Sign" tab. 
        <br /><br />
        Then, you need to assemble these signatures and send them to the blockchain using the "Send" tab.
      </header>

     <Dapp />

      <footer>
        ---
        <br /><br />
        <p className="bold">Why does this website look like shit? How can I trust it?</p>
        <br />
        It takes inspiration from the <a href="https://motherfuckingwebsite.com/" target="_blank">Mother Fucking Website</a> and my laziness. Didn't the website load super fast? Nice, right? It's also primarily a developer tool. If you're not sure you can trust it, <a href="https://github.com/devanonon/ethw-gnosis-recovery" target="_blank">verify the source code.</a> Also, feel free to make a nicer UI ¯\_(ツ)_/¯.
        <br /><br />
        <p className="bold">Why build it?</p>
        <br />
        I already had most of the code from a <a href="https://github.com/devanonon/bsc-gnosis-recovery" target="_blank">previous project</a>. 
        <br /><br />
        <p className="small">This tool is not responsible for any erroneous transactions which may occur. This tool merely aids developers in
        building and propagating Gnosis Safe Multisig transactions for ETHW.</p>
      </footer>
    </div>
  );
}
