import React, { useState, useEffect } from 'react';
import { PencilSquare, XSquareFill } from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Slide, toast } from 'react-toastify';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProducts } from '../Redux/ProductSlice'; // Redux action for fetching products
import LayOut from "../../LayOut/LayOut"; // Assuming LayOut is being reused for consistent styling


const ProductsView = () => {
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    // const { products, loading, error } = useSelector(state => state.products); // Access Redux state
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch all products on component mount
    // useEffect(() => {
    //     dispatch(fetchProducts());
    // }, [dispatch]);

    // Filter products based on search term
    // useEffect(() => {
    //     if (products && Array.isArray(products)) {
    //         const result = products.filter((product) =>
    //             product.productName.toLowerCase().includes(search.toLowerCase())
    //         );
    //         setFilteredData(result);
    //     } else {
    //         setFilteredData([]);
    //     }
    // }, [search, products]);

    const handleEdit = (productId) => {
        navigate(`/productsRegistration`, { state: { productId } });
    };

    const handleDelete = async (productId) => {
        try {
            // Make a DELETE request to the API with the given ID
            // const response = await ProductDeleteApiById(productId);
            // dispatch(fetchProducts()); // Refetch products from the Redux store
            toast.error('Product deleted successfully', { // Show toast notification
                position: 'top-right',
                transition: Slide,
                hideProgressBar: true,
                theme: "colored",
                autoClose: 1000, // Close the toast after 1 second
            });
            // console.log(response);
        } catch (error) {
            console.error(error.response);
            if (error.response && error.response.data) {
                console.error('Server Error Message:', error.response.data);
            }
        }
    };

    const columns = [
        {
            name: "Product ID",
            selector: (row) => row.productId,
            width: "150px"
        },
        {
            name: "Product Name",
            selector: (row) => row.productName,
            width: "250px"
        },
        {
            name: "Product Cost",
            selector: (row) => row.cost,
            width: "150px"
        },
        {
            name: "HSN Code",
            selector: (row) => row.hsnNo,
            width: "150px"
        },
        {
            name: "Actions",
            cell: (row) => (
                <div>
                    <button 
                        className="btn btn-sm" 
                        style={{ backgroundColor: "transparent" }} 
                        onClick={() => handleEdit(row.productId)} 
                        title="Edit"
                    >
                        <PencilSquare size={22} color='#2255a4' />
                    </button>
                    <button 
                        className="btn btn-sm" 
                        style={{ backgroundColor: "transparent" }} 
                        onClick={() => handleDelete(row.productId)} 
                        title="Delete"
                    >
                        <XSquareFill size={22} color='#da542e' />
                    </button>
                </div>
            ),
            width: "150px"
        }
    ];

    const getFilteredList = (searchTerm) => {
        setSearch(searchTerm);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Products</strong></h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to={"/"}>Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Products</li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Search and Filter Form */}
                <div className="row">
                    <div className="col-12 col-lg-12 col-xxl-12 d-flex">
                        <div className="card flex-fill">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col-md-4">
                                        <Link to={"/productRegistartion"}>
                                            <button className="btn btn-primary">Add Product</button>
                                        </Link>
                                    </div>
                                    <div className="col-md-4 offset-md-4 d-flex justify-content-end">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search..."
                                            value={search}
                                            onChange={(e) => getFilteredList(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                pagination
                                paginationPerPage={rowsPerPage}
                                onChangePage={page => setCurrentPage(page)}
                                onChangeRowsPerPage={perPage => setRowsPerPage(perPage)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </LayOut>
    );
};

export default ProductsView;
