# gsp-react-framework 使用说明

##  组件结构

将React原有的component.js拆分成<code>components.js</code>、<code>component.viewmodel.js</code>两部分，前者负责页面展现，后者负责数据处理逻辑。通过在component.js中创建VM实例进行数据绑定和事件触发。

### components.js
  
  ``` 
import {Component} from 'gsp-react-framework';
import AppViewModel from './app.viewmodel';
export default class App extends Component {
    constructor(props) {
        super(props, new AppViewModel());
        this.viewModel.bindDataToStorage();
    }
}
  ``` 
 
- **extends Component**

    组件基类Component不是React.Component，而是经过封装的Component组件

- **constructor**

    在constructor方法第一行调用super方法绑定ViewModel实例，并调用bindDataToStorage()绑定ViewModel中的data数据。之后便可以通过<code>this.viewModel</code>对象访问到VM中的数据和方法。

- **state、data**

    component中的数据来源于<code>this.viewModel</code>中的<code>state</code> 和<code>data</code>

 - state：immutable类型，存放页面上状态切换等效果，通过<code>this.viewModel.getState()</code>方法获取Object对象。
 - data：数组，存放页面上的数据源数据

    ```
    render() {
        let state = this.viewModel.getState();
        let data = this.viewModel.data||[];
        return (
            <h1 className="App-title"  style={{ display: state.showWelcome ? 'block' : 'none' }}>Welcome to React</h1>
            <ListComponent ticketList={data}></ListComponent>
        )
    }
    ```
- **生命周期方法**
    
    若需使用react的生命周期方法<code>componentWillReceiveProps, componentWillMount, componentDidMount, componentWillUpdate, componentDidUpdate, componentWillUnmount</code> ,需要先调用super方法。
    
    ```
    componentDidMount() {
        super.componentDidMount();
        this.viewModel.queryTicket();
    }
     ```
- **事件调用**
    - 无参数
    
        ```
        <div className="addDiv" onClick={this.viewModel.addTicket}>
            <span>+</span>
        </div>
        ```
        onClick事件可以直接绑定viewModel中的方法名，注意不能写addTicket()，否则会导致程序出错。
        
    - 带参数
    
        ```
        <List.Item onClick={this.viewModel.changePage.bind(this.viewModel, item.rojpsqD_NM)}>
            .....
        </List.Item>
        ```
        我们知道React.Component创建组件时，事件函数并不会自动绑定this，需要我们手动绑定，不然this将不会指向当前组件的实例对象。因此携带参数的场景需要先绑定this.viewModel对象，然后再写参数。

### component.viewmodel.js

  ```
 import {ViewModel} from "gsp-react-framework";
 import { schema } from './ticket.schema';
 export default class AppViewModel extends ViewModel {
    constructor() {
        super(schema);
        this.setState({
            showWelcome: true
        });
    }
}
  ```
 
- **extends ViewModel**

    基类ViewModel中预置了View层需要的组件状态数据state和数据源数据data，并提供了一系列方法进行取值和赋值操作，state和data的改变会导致Component的重新渲染。
    
    - schema

        scheme对象表示数据源主键和各字段名称、类型、默认值等信息，以机票申请单为例，ticket.schema.js结构如下：

        ```
            export let schema = {
                primaryKey: "rojpsqD_NM",
                columns: [
                {
                    "name": "rojpsqD_NM",
                    "defaultValue": "",
                    "type": "String"
                },
                {
                    "name": "rojpsqD_SQR",
                    "defaultValue": "",
                    "type": "String"
                },
                {
                    "name": "rojpsqD_SQRMC",
                    "defaultValue": "",
                    "type": "String"
                }
                ......
            ]}
        ```
    
    - <code>getState(key)</code> 获取Object类型的state数据，若指定key值则返回key值对应的数据
    - <code>setState(object)</code> 增量修改state数据    
    - <code>bindDataToStorage()</code> View层绑定ViewModel中的数据源数据，需要在component.constructor中调用。
    - <code>initDataStorage(initData)</code> 根据初始数据构建storage
     
        ```
        constructor() {
            super(schema);
            let initData = [];
            this.initDataStorage(initData);
        }
        ```
          
    - <code>getData()</code> 获取组件全量数据，返回数组类型
    
    - <code>loadData(data)</code> 全量刷新数据
    
    - <code>addRecord(data)</code> 新增一行记录，传入Object
        
        ```
        let initData = { "rojpsqD_CXFW": "0", "rojpsqD_DCWF": "DC"}
        this.addRecord(initData);
        ```
            
    - <code>removeRecord(primaryValue)</code>  删除一行记录，传入主键值
     
        ```
        deleteMx(item) {
            this.removeRecord(item.rojpsqmX_NM);
        }
        ```
    
    - <code>getChanges()</code> 获取组件增量数据
        
    - <code>getSubChanges(subKey)</code> 根据子组件的ref标识来获取子组件增量数据
    
    - <code>getSubData(subKey)</code> 根据子组件的ref标识来获取子组件全量数据
        
        component.js :
        
        ```
        <TicketDetailComponent rojpsqD_NM={state.rojpsqD_NM}
                    changeCXFWEvent={this.viewModel.changeCXFWEvent} ref="tickeDetail">
        </TicketDetailComponent>
        <div onClick={this.viewModel.save}>保存</div>
        ```
        
        component.viewmodel.js：
        
        ```
        save() {
            let subDatas = this.getSubData("tickeDetail");
            console.log("全量数据：" + subDatas);

            let subChanges = this.getSubChanges("tickeDetail");
            console.log("增量数据：" + subChanges);
            }
        ```
    
- **访问组件props属性**
    
    基类ViewModel中封装了React.Component原生props属性，因此在viewModel子类中可以直接访问this.props.XXX

    Component中可以访问this.viewModel.props.XXX

- **访问组件refs**
    
    在React中可以通过定义ref来更有针对性的获取元素，基类ViewModel中已经封装了refs属性，因此在viewModel子类中可以直接访问this.refs.XXX

- **路由跳转**
    
    viewModel中的路由跳转方式与原生React Router相同
    ```
    changePage() {
        this.props.history.push({
            pathname: "/ticketApply",
            state: {
                isAdd: true
            }
        })
    }
    ```

- **变量不可扩展性**
    
    viewModel中的变量是不可扩展的，若想在方法中新增this.XXX必须在constructor中声明才可以使用


