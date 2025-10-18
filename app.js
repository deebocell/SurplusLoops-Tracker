const { useState } = React;

function SurplusLoopEmissionsTracker() {
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Excavator',
    year: new Date().getFullYear(),
  });

  const machineDatabase = {
    'Excavator': { weight: 18, co2PerYear: 2.5 },
    'Shovel': { weight: 12, co2PerYear: 1.8 },
    'Roller': { weight: 7, co2PerYear: 1.2 },
    'Dozer': { weight: 22, co2PerYear: 3.0 },
    'Loader': { weight: 16, co2PerYear: 2.2 },
    'Tractor': { weight: 5, co2PerYear: 0.8 },
    'Other': { weight: 10, co2PerYear: 1.5 }
  };

  const calculateEmissions = (machineYear, machineType) => {
    const currentYear = 2025;
    const ageYears = currentYear - machineYear;
    const remainingLife = Math.max(15 - (ageYears / 10), 5);
    
    const scrapWeight = machineDatabase[machineType]?.weight || 10;
    const scrappingCO2 = scrapWeight * 0.25;
    
    const operationalCO2PerYear = machineDatabase[machineType]?.co2PerYear || 1.5;
    const operationalCO2Total = operationalCO2PerYear * remainingLife;
    
    const emissionsAvoided = Math.max(scrappingCO2 - (operationalCO2Total * 0.3), 0);
    
    return {
      emissionsAvoided: parseFloat(emissionsAvoided.toFixed(2)),
      wasteAvoided: scrapWeight,
      remainingLife: remainingLife.toFixed(1)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value) : value
    });
  };

  const handleAddMachine = () => {
    if (!formData.name || !formData.year) {
      alert('Please fill in machine name and year');
      return;
    }

    const impact = calculateEmissions(formData.year, formData.type);
    const newMachine = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      year: formData.year,
      age: 2025 - formData.year,
      ...impact
    };

    setMachines([...machines, newMachine]);
    setFormData({
      name: '',
      type: 'Excavator',
      year: new Date().getFullYear(),
    });
  };

  const handleDeleteMachine = (id) => {
    setMachines(machines.filter(m => m.id !== id));
  };

  const totalEmissionsAvoided = machines.reduce((sum, m) => sum + m.emissionsAvoided, 0);
  const totalWasteAvoided = machines.reduce((sum, m) => sum + m.wasteAvoided, 0);
  const avgMachineAge = machines.length > 0 ? (machines.reduce((sum, m) => sum + m.age, 0) / machines.length).toFixed(1) : 0;

  const typeData = {};
  machines.forEach(m => {
    if (!typeData[m.type]) {
      typeData[m.type] = { name: m.type, emissions: 0, waste: 0, count: 0 };
    }
    typeData[m.type].emissions += m.emissionsAvoided;
    typeData[m.type].waste += m.wasteAvoided;
    typeData[m.type].count += 1;
  });

  const chartData = Object.values(typeData);

  const ageGroupData = {
    '0-5 years': machines.filter(m => m.age <= 5).length,
    '6-10 years': machines.filter(m => m.age > 5 && m.age <= 10).length,
    '11-20 years': machines.filter(m => m.age > 10 && m.age <= 20).length,
    '20+ years': machines.filter(m => m.age > 20).length
  };

  const ageGroupChartData = Object.entries(ageGroupData).map(([range, count]) => ({
    name: range,
    machines: count
  })).filter(d => d.machines > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SurplusLoop Emissions Tracker</h1>
          <p className="text-gray-600">Track waste and carbon emissions from industrial surplus machinery</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-green-500">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Machine</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Machine Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., HITACHI EX200"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {Object.keys(machineDatabase).map(type => (
                  React.createElement('option', { key: type, value: type }, type)
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year Manufactured</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1980"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Est. Weight (MT)</label>
              <input
                type="number"
                value={machineDatabase[formData.type]?.weight || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>

            <button
              onClick={handleAddMachine}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              + Add Machine
            </button>
          </div>
        </div>

        {machines.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-green-100 text-sm font-medium mb-1">Total CO₂ Avoided</p>
              <p className="text-4xl font-bold">{totalEmissionsAvoided.toFixed(1)}</p>
              <p className="text-green-100 text-xs mt-2">Metric Tons per Year</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-blue-100 text-sm font-medium mb-1">Total Waste Diverted</p>
              <p className="text-4xl font-bold">{totalWasteAvoided.toFixed(1)}</p>
              <p className="text-blue-100 text-xs mt-2">Metric Tons of Material</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-orange-100 text-sm font-medium mb-1">Machines Tracked</p>
              <p className="text-4xl font-bold">{machines.length}</p>
              <p className="text-orange-100 text-xs mt-2">Active Assets</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-purple-100 text-sm font-medium mb-1">Avg Machine Age</p>
              <p className="text-4xl font-bold">{avgMachineAge}</p>
              <p className="text-purple-100 text-xs mt-2">Years</p>
            </div>
          </div>
        )}

        {machines.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Machine Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Machine Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Year</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Age</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Weight (MT)</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">CO₂ Avoided</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Waste Diverted</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Remaining Life</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map(m => (
                    React.createElement('tr', { key: m.id, className: 'border-b hover:bg-gray-50' },
                      React.createElement('td', { className: 'px-4 py-3 font-medium text-gray-900' }, m.name),
                      React.createElement('td', { className: 'px-4 py-3 text-gray-600' }, m.type),
                      React.createElement('td', { className: 'px-4 py-3 text-center text-gray-600' }, m.year),
                      React.createElement('td', { className: 'px-4 py-3 text-center text-gray-600' }, m.age + ' yrs'),
                      React.createElement('td', { className: 'px-4 py-3 text-center text-gray-600' }, m.wasteAvoided.toFixed(1)),
                      React.createElement('td', { className: 'px-4 py-3 text-center font-semibold text-green-600' }, m.emissionsAvoided.toFixed(2) + ' MT'),
                      React.createElement('td', { className: 'px-4 py-3 text-center text-blue-600 font-semibold' }, m.wasteAvoided.toFixed(1) + ' MT'),
                      React.createElement('td', { className: 'px-4 py-3 text-center text-gray-600' }, m.remainingLife + ' yrs'),
                      React.createElement('td', { className: 'px-4 py-3 text-center' },
                        React.createElement('button', {
                          onClick: () => handleDeleteMachine(m.id),
                          className: 'text-red-600 hover:text-red-800 font-semibold transition'
                        }, '🗑️')
                      )
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {machines.length > 0 && (
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Circular Economy Impact Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-green-100 text-sm mb-2">Environmental Impact</p>
                <p className="text-3xl font-bold">{totalEmissionsAvoided.toFixed(1)} MT CO₂</p>
                <p className="text-sm text-green-100 mt-3">Equivalent to planting {Math.round(totalEmissionsAvoided * 16)} trees or removing {Math.round(totalEmissionsAvoided * 200)} cars from roads for 1 year</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-2">Waste Prevention</p>
                <p className="text-3xl font-bold">{totalWasteAvoided.toFixed(1)} MT</p>
                <p className="text-sm text-green-100 mt-3">Of scrap material kept in circular economy instead of landfill</p>
              </div>
              <div>
                <p className="text-green-100 text-sm mb-2">Operational Lifespan</p>
                <p className="text-3xl font-bold">{(machines.reduce((sum, m) => sum + parseFloat(m.remainingLife), 0) / machines.length).toFixed(1)} yrs</p>
                <p className="text-sm text-green-100 mt-3">Average remaining productive life per asset</p>
              </div>
            </div>
          </div>
        )}

        {machines.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No machines added yet. Start by adding a machine above to track its environmental impact.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(SurplusLoopEmissionsTracker));
