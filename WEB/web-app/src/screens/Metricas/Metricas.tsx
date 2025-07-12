import { useState, useEffect } from 'react';

const OPCIONES = [
    { texto: 'Hoy' },
    { texto: 'Semana' },
    { texto: 'Mes' },
    { texto: 'Trimestre' },
    { texto: 'Semestre' },
    { texto: 'Año' },
];


export const Metricas = () => {

    const [filtro, setFiltro] = useState(OPCIONES[0].texto); // “Hoy” por defecto



    useEffect(() => {
        //aqui mandamos a llamar el servicio

    }, [filtro]);

    const handleChange = (nuevo = "") => setFiltro(nuevo);

    return (
        <div>

            <div className="toolbar pb-2 pt-2" id="kt_toolbar">
                {/* Botones: visibles desde sm ≥ 576 px */}
                <div className="container-fluid d-none d-sm-flex flex-nowrap gap-2">
                    {OPCIONES.map(({ texto }) => (
                        <button
                            key={texto}
                            type="button"
                            onClick={() => handleChange(texto)}
                            className={`btn btn-active-primary  ${filtro === texto ? 'active' : ''}`}
                        >
                            {texto}
                        </button>
                    ))}
                </div>

                {/* Select: visible solo en xs */}
                <div className="container-fluid d-block d-sm-none" style={{ paddingTop: '5px;', paddingBottom: '5px;' }}>
                    <select
                        className="form-select"
                        value={filtro}
                        onChange={(e) => handleChange(e.target.value)}
                    >
                        {OPCIONES.map(({ texto }) => (
                            <option key={texto} value={texto}>
                                {texto}
                            </option>
                        ))}
                    </select>




                </div>
            </div>



            <div className="col-xl-12" style={{ marginTop: '55px' }}>
                <div className="card card-xl-stretch mb-xl-8">
                    <div className="card-body p-4">
                        <div className="card position-relative">
                            <div className="row">

                                <div className='col-xl-3 p-2'>
                                    <div className="bg-light-info py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
                                            <i className="bi bi-arrow-down text-info" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-info text-nowrap">
                                            <span className="fw-bold fs-6">Cuentas&nbsp;Por&nbsp;</span>
                                            <span className="fw-bolder fs-2">Cobrar</span>
                                        </a>
                                        <div className="fw-bolder fs-1 text-info">₡15,300</div>
                                    </div>
                                </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-light-warning py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
                                            <i className="bi bi-arrow-up text-warning" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-warning text-nowrap">
                                            <span className="fw-bold fs-6">Cuentas&nbsp;Por&nbsp;</span>
                                            <span className="fw-bolder fs-2">Pagar</span>
                                        </a><div className="fw-bolder fs-1 text-warning">₡1,300</div>
                                    </div>
                                </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-light-primary py-8 rounded-2 p-5">

                                        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
                                            <i className="bi bi-calculator text-primary" style={{ fontSize: 'xx-large' }}></i>
                                        </span>


                                        <a href="#" className="text-primary text-nowrap">
                                            <span className="fw-bolder fs-2">Balance </span>

                                            <span className="fw-bold fs-6">de Cuentas (CxC-CxP)</span>

                                        </a>
                                        <div className="fw-bolder fs-1 text-primary">₡14,000</div>
                                    </div>
                                </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-light-success py-8 rounded-2 p-5">

                                        <span className="svg-icon svg-icon-3x svg-icon-warning d-block my-2">
                                            <i className="bi bi-clipboard-data text-success" style={{ fontSize: 'xx-large' }}></i>
                                        </span>


                                        <a href="#" className="text-success text-nowrap">
                                            <span className="fw-bolder fs-2">Crecimiento </span>

                                            <span className="fw-bold fs-6">de Cuentas (CxC vs CxP)</span>

                                        </a>
                                        <div className="fw-bolder fs-1 text-success">2.5% <span className="fw-bold fs-6">Objetivo: 4%</span></div>
                                    </div>
                                </div>

                            </div>


                            <div className="row">

                                <div className='col-xl-3 p-2'>
                                    <div className="bg-secondary py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-gray-800 d-block my-2">
                                            <i className="bi bi-clipboard-check text-gray-800" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-gray-800 text-nowrap">

                                            <span className="fw-bolder fs-2">Ordenes de Servicio</span>
                                        </a>
                                        <div className="fw-bolder fs-1 text-gray-800">5 <span className="fw-bold fs-6">(5 Finalizadas)</span></div>
                                    </div>
                                </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-secondary py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-gray-800 d-block my-2">
                                            <i className="bi bi-people text-gray-800" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-gray-800 text-nowrap">

                                            <span className="fw-bolder fs-2">Clientes </span>
                                            <span className="fw-bold fs-6">Nuevos</span>
                                        </a>
                                        <div className="fw-bolder fs-1 text-gray-800">3</div>
                                    </div> </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-secondary py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-gray-800 d-block my-2">
                                            <i className="bi bi-arrow-left-right text-gray-800" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-gray-800 text-nowrap">
                                            <span className="fw-bolder fs-2">Transacciones</span>
                                            <span className="fw-bold fs-6"></span>
                                        </a>
                                        <div className="fw-bolder fs-1 text-gray-800">15 <span className="fw-bold fs-6">(5 Gasto) (10 Ingreso)</span></div>

                                    </div> </div>
                                <div className='col-xl-3 p-2'>
                                    <div className="bg-secondary py-8 rounded-2 p-5">


                                        <span className="svg-icon svg-icon-3x svg-icon-gray-800 d-block my-2">
                                            <i className="bi bi-cash-stack text-gray-800" style={{ fontSize: 'xx-large' }}></i>
                                        </span>

                                        <a href="#" className="text-gray-800 text-nowrap">

                                            <span className="fw-bolder fs-2">Cuentas</span>
                                        </a>
                                        <div className="fw-bolder fs-1 text-gray-800">10 <span className="fw-bold fs-6">(6 CxC) (4 CxP)</span></div>
                                    </div></div>

                            </div>
                        </div>








                        <div className="separator border-5 my-10"></div>
                    </div>

                </div>

            </div>
        </div>
    )
};
