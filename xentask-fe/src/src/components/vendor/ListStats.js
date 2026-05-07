import { Chart } from 'primereact/chart';

const ListStats = (id) => {

    /**
     * Get Request Here
     */
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ],
        datasets: [
          {
            label: 'Closed Tasks',
            data: [30,50,20,60,80,10,7,8,9,50,12,8], 
            backgroundColor: 'rgba(40, 167, 69)', 
          },
          {
            label: 'Overdue',
            data: [30,50,20,60,80,10,7,8,9,50,12,8], 
            backgroundColor: 'rgba(220, 53, 69)',
          },
        ],
      };

      const options = {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      };

    return (
       
        <div className="card">

            <div className="card-header">
                <h3>Stats</h3>
            </div>

            <div className="card-body">

        
            <Chart type="bar" data={data} options={options} />

            </div>
        </div>

    );

};


export default ListStats;