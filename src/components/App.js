import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import AddProduct from './AddProduct';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData();
  }
  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }  
  }
  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({accounts: accounts[0]});
    // console.log(Marketplace.abi,Marketplace.networks[5777].address);
    const networkId = await web3.eth.net.getId();
    const networkData = Marketplace.networks[networkId];
    if(networkData)
    {
      const markplace = web3.eth.Contract(Marketplace.abi,networkData.address);
      this.setState({markplace});
      const productCount = await markplace.methods.productCount().call()
      this.setState({productCount});
      //load product
      for(let i=1; i<=productCount; i++)
      {
        const product = await markplace.methods.products(i).call();
        this.setState({products: [...this.state.products, product]}); //ek or product array m add kry ga ...
      }
      this.setState({loading:false});
    }else{
      window.alert("network not deploy to network");
    }
    
  }

  constructor(props)
  {
    super(props);
    this.state = {
      'accounts': '',
      'productCount':0,
      'products': [],
      'loading': true
    }
    this.createProduct = this.createProduct.bind(this);
    this.purchasedProduct = this.purchasedProduct.bind(this);
  }

  createProduct(name, price)
  {
    this.setState({loading:true});
    this.state.markplace.methods.createProduct(name,price).send({from: this.state.accounts})
    .once('receipt',(receipt)=>{
      this.setState({loading:false})
    })
  }

  purchasedProduct(id, price)
  {
    this.setState({loading:true});
    this.state.markplace.methods.purchaseProduct(id).send({from: this.state.accounts, value: price})
    .once('receipt',(receipt)=>{
      this.setState({loading:false})
    })
  }

  render() {
    return (
      <div>
       <Navbar accounts={this.state.accounts}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center text-center">
              {this.state.loading 
              ? <div className='text-center'><p className='text-center'>Loading...</p></div> 
              : <AddProduct products = {this.state.products} purchasedProduct = {this.purchasedProduct} createProduct={this.createProduct}/>
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
