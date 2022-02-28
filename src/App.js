import logo from './logo.svg';
import './App.css';
import elasticlunr from 'elasticlunr';
import React, { Component } from 'react'; 
import euData from './eu';
import cnData from './cn';
import usaData from './usa';
import hkData from './hk';
import Fuse from 'fuse.js';


var usaIndex = elasticlunr(function () {
    this.addField('title');
	this.addField('body');
    this.setRef('id');
});



var index = elasticlunr(function () {
    this.addField('title');
	this.addField('body');
    this.setRef('id');
});


var euList = euData.deviceList;
console.log(euList[2]);
var newEUList = new Array()
for (var i=0; i< euList.length; i++) {
  var commercial_name = euList[i].commercial_name
  var manufacturer = euList[i].manufacturer.name
  var hsc_common_list = euList[i].hsc_common_list
  var doc = {"id": i,
                "title": commercial_name +  " " + manufacturer,
				"body": "",
				"commercial_name": commercial_name, 
				"hsc_common_list": hsc_common_list,
				"manufacturer": manufacturer, 
                "source": "EU",
				"source_label": "歐盟" }
  index.addDoc(doc);
  newEUList.push(doc);
}


const options = {
  includeScore: true,
  threshold: 0.2,
  keys: ['title', 'commercial_name', 'manufacturer']
}

const euFuse = new Fuse(newEUList, options)


var usaList = usaData;
var newUSAList = new Array()
for (var i=0; i< usaList.length; i++) {
  var commercial_name = usaList[i].commercial_name
  var manufacturer = usaList[i].manufacturer
  var hsc_common_list = "N/A"
  var doc = {"id": i,
                "title": commercial_name +  " " + manufacturer,
				"body": "",
				"commercial_name": commercial_name, 
				"hsc_common_list": hsc_common_list,
				"manufacturer": manufacturer, 
                "source": "FDA",
				"source_label": "美國FDA" }
  newUSAList.push(doc)
}


const usaFuse = new Fuse(newUSAList, options)



var hkList = hkData;
var newHKList = new Array()
for (var i=0; i< hkList.length; i++) {
  var commercial_name = hkList[i].commercial_name
  var manufacturer = hkList[i].manufacturer
  var hsc_common_list = "N/A"
  var doc = {"id": i,
                "title": commercial_name +  " " + manufacturer,
				"body": "",
				"commercial_name": commercial_name, 
				"hsc_common_list": hsc_common_list,
				"manufacturer": manufacturer, 
                "source": "HK",
				"source_label": "衞生署" }
  newHKList.push(doc)
}


const hkFuse = new Fuse(newHKList, options)


var cnList = cnData;
for (var i=0; i< cnList.length; i++) {
  var commercial_name = cnList[i].commercial_name
  var manufacturer = cnList[i].manufacturer
  var hsc_common_list = "N/A"
  console.log(cnList[i]);
}

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: 'Abbott', result: []};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({...this.state, value: event.target.value});
  }

  handleSubmit(event) {
    const keyword = this.state.value;
    var euResult = euFuse.search(keyword).map(r => ({ref: r.refIndex, source: "EU"}));
    var usaResult = usaFuse.search(keyword).map(r => ({ref: r.refIndex, source: "FDA"}));
    var hkResult = hkFuse.search(keyword).map(r => ({ref: r.refIndex, source: "HK"}));
    var result = euResult.concat(usaResult).concat(hkResult);
    for (var i=0; i < cnList.length; i++) {
       var obj = cnList[i];
       var body = obj.commercial_name + " " + obj.manufacturer
       if (body.search(keyword) >= 0) {
          result.push({ref: i, source: "CN"})
       }
    }
    
    this.setState({...this.state, result: result});
    event.preventDefault();
  }

  renderResult(r) {
    if (r.source == "EU") {
      var doc = newEUList[r.ref]
      return (<tr key={r.ref}><td>{doc.commercial_name}</td><td>{doc.manufacturer}</td><td>{doc.source_label}</td><td>{doc.hsc_common_list}</td></tr>)
    }
    if (r.source == "HK") {
      var doc = newHKList[r.ref]
      return (<tr key={r.ref}><td>{doc.commercial_name}</td><td>{doc.manufacturer}</td><td>{doc.source_label}</td><td>{doc.hsc_common_list}</td></tr>)
    }

    if (r.source == "FDA") {
      var doc = newUSAList[r.ref]
      return (<tr key={r.ref}><td>{doc.commercial_name}</td><td>{doc.manufacturer}</td><td>{doc.source_label}</td><td>{doc.hsc_common_list}</td></tr>)
    }

    if (r.source == "CN") {
      var doc = cnList[r.ref]
      var source_label = "國家葯監局批准的新冠疫情防控醫療器械產品名單";
      doc.source = "CN"
      doc.hsc_common_list = "N/A"
      return (<tr key={r.ref}><td>{doc.commercial_name}</td><td>{doc.manufacturer}</td><td>{source_label}</td><td>{doc.hsc_common_list}</td></tr>)

    }
    return (<tr></tr>);
  }

  render() {
    return (
      <div>
        <h1>快速抗原測試搜尋器</h1>
		  本網站由人手整合美國FDA ，香港衛生署，歐盟及國家藥監局批准的新冠疫情防控醫療器械產品名單製成的搜尋器，如有任何錯誤，敬請原諒及inbox <a href="https://www.facebook.com/howawong.hww" about="_blank">FB</a>。<br/><br/>
      <form onSubmit={this.handleSubmit}>
        <label>
          關鍵字：
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
		&nbsp;
		&nbsp;
		&nbsp;
        <input type="submit" value="搜尋" />
		<br/>
		<br/>
		<br/>
		<table border="1" style={{width:"100%"}}>
		   <tr>
		     <th>
			   名字
			 </th>
			 <th>
			   廠商
			 </th>
			 <th>
			   資料來源
			 </th>
			 <th>
			   HSC Common List (如適用)
			 </th>
		   </tr>
           { this.state.result.map(r => this.renderResult(r)) }
		</table>
      </form>
      </div>
    );
  }
}

export default NameForm;
