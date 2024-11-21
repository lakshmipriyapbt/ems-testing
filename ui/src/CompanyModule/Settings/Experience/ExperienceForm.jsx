import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import LayOut from "../../../LayOut/LayOut";
import { EmployeeGetApi, EmployeeGetApiById,ExperienceFormPostApi, TemplateGetAPI } from "../../../Utils/Axios";
import { useAuth } from "../../../Context/AuthContext";
import ExperiencePreview from "./ExperiencePreview";

const ExperienceForm = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm();
  const { user } = useAuth();
  const [emp, setEmp] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [noticePeriod, setNoticePeriod] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error,setError]=useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // New state to store the selected employee
  const [templateAvailable, setTemplateAvailable] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const calculateNoticePeriod = (resignationDate, lastWorkingDate,dateOfHiring) => {
    if (resignationDate && lastWorkingDate) {
      const resignation = new Date(resignationDate);
      const lastWorking = new Date(lastWorkingDate);
      const hiringDate = new Date(dateOfHiring);
  
      // Check if last working date is after resignation date
      if (lastWorking <= resignation) {
        setError("Last working date must be after the resignation date.");
        setNoticePeriod(0);
        return;
      }
      else if  (resignation <= hiringDate) {
        setError("Resignation date must be after the date of hiring.");
        setNoticePeriod(0);
        return;
      }
  
      const monthDiff = (lastWorking.getFullYear() - resignation.getFullYear()) * 12 + (lastWorking.getMonth() - resignation.getMonth());
      setNoticePeriod(monthDiff);
    } else {
      setNoticePeriod(0);
    }
  };

  useEffect(() => {
    const subscription = watch((value) => {
      calculateNoticePeriod(value.resignationDate, value.lastWorkingDate, value.dateOfHiring);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    EmployeeGetApi().then((data) => {
      const filteredData = data
        .filter((employee) => employee.firstName !== null)
        .map(({ referenceId, ...rest }) => rest);
      setEmp(
        filteredData.map((employee) => ({
          label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
          value: employee.id,
          employeeName:`${employee.firstName} ${employee.lastName}`,
          employeeId:employee.employeeId,
          designationName: employee.designationName,
          departmentName: employee.departmentName,
          dateOfHiring: employee.dateOfHiring,
        }))
      );
    });
  }, []);

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNumber = res.data.data.experienceTemplateNo;
         setSelectedTemplate(templateNumber)
         setTemplateAvailable(!!templateNumber); 
    } catch (error) {
      handleApiErrors(error);
      setTemplateAvailable(false); 
    }
  };
  useEffect(() => {
    fetchTemplate()
}, []);

// Helper function to format date as dd-mm-yyyy
const formatDate = (date) => {
  if (!date) return ""; // If the date is falsy, return an empty string
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0"); // Get the day, ensuring two digits
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Get the month (0-indexed)
  const year = d.getFullYear(); // Get the full year
  
  return `${day}-${month}-${year}`;
};

  const onSubmit = (data) => {
    const submissionData = {
      employeeId: data.employeeId, 
      companyName: user.company,
      date:data.lastWorkingDate 
    }; 
     // Format the date fields to dd-mm-yyyy format
    const formattedLastWorkingDate = formatDate(data.lastWorkingDate);
    const formattedResignationDate = formatDate(data.resignationDate);
    const formattedHiringDate = formatDate(data.dateOfHiring);
    const preview = {
      employeeName: selectedEmployee ? selectedEmployee.employeeName : data.employeeName,
      employeeId: selectedEmployee ? selectedEmployee.employeeId : data.employeeId,
      designationName: data.designationName || "",
      departmentName: data.departmentName || "",
      joiningDate:formattedHiringDate||"",
      experienceDate: formattedResignationDate || "", // Resignation date formatted
      date: formattedLastWorkingDate || "",
      noticePeriod,
      companyName: user.company,
    };
    
    setPreviewData(preview);
    setShowPreview(true);
    setSubmissionData(submissionData);
  };

  const handleConfirmSubmission = async () => {
    try {
        const success = await ExperienceFormPostApi(submissionData);
        if (success) {
          setShowPreview(true);
          reset();
        }
      } catch (error) {
        console.error('Error downloading the PDF:', error);
        handleError(error)
      }
  };
   
  const handleError = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      toast.error("Network Error!", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    }
  };

  const clearForm = () => {
    reset();
    navigate("/relievingview");
  };

  useEffect(() => {
    if (location.state && location.state.employeeId) {
      EmployeeGetApiById(location.state.employeeId)
        .then((response) => {
          reset(response.data);
          setIsUpdating(true);
        })
        .catch((errors) => {
          handleError(errors);
        });
    }
  }, [location.state, reset]);

  const nextSixMonths = new Date();
  nextSixMonths.setMonth(nextSixMonths.getMonth() + 6);
  const sixMonthsFromNow = nextSixMonths.toISOString().split("T")[0];

  const handleApiErrors = (errors) => {
    if (errors.response) {
      const status = errors.response.status;
      let errorMessage = "";

      switch (status) {
        case 403:
          errorMessage = "Session Timeout!";
          navigate("/");
          break;
        case 404:
          errorMessage = "Resource Not Found!";
          break;
        case 406:
          errorMessage = "Invalid Details!";
          break;
        case 500:
          errorMessage = "Server Error!";
          break;
        default:
          errorMessage = "An Error Occurred!";
          break;
      }

      toast.error(errorMessage, {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    } else {
      toast.error("Network Error!", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
    }
  };


    // Render loading message or template not available message
    if (!templateAvailable) {
        return (
          <LayOut>
            <div className="container-fluid p-0">
              <div className="row justify-content-center">
                <div className="col-8 text-center mt-5">
                  <h2>No Experience Template Available</h2>
                  <p>To set up the experience templates before proceeding, Please select the Template from Settings <a href="/experienceLetter">Expereince Templates </a></p>
                  <p>Please contact the administrator to set up the experience templates before proceeding.</p>
                </div>
              </div>
            </div>
          </LayOut>
        );
      }

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1">
          <div className="col">
            <h1 className="h3">
              <strong>Experience Form</strong>
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Generate Experience</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">
                  {isUpdating ? "Employee Experience Data" : "Employee Experience Form"}
                </h5>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    {isUpdating ? (
                      <div className="col-12 col-md-6 col-lg-5 mb-3">
                        <label className="form-label">Employee Name</label>
                        <input
                          type="text"
                          readOnly
                          className="form-control"
                          name="employeeName"
                          {...register("employeeName", { required: true })}
                        />
                        {errors.employeeName && (
                          <p className="errorMsg">Employee Name Required</p>
                        )}
                      </div>
                    ) : (
                      <div className="col-12 col-md-6 col-lg-5 mb-2">
                        <label className="form-label">Select Employee Name</label>
                        <Controller
                          name="employeeId"
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={emp}
                              value={emp.find((option) => option.value === field.value)}
                              onChange={(selectedOption) => {
                                field.onChange(selectedOption.value);
                                const selectedEmp = emp.find(emp => emp.value === selectedOption.value);
                                if (selectedEmp) {
                                  setSelectedEmployee(selectedEmp);
                                  // Use selectedEmp instead of selectedEmployee here
                                  setValue("designationName", selectedEmp.designationName);
                                  setValue("departmentName", selectedEmp.departmentName);
                                  setValue("dateOfHiring", selectedEmp.dateOfHiring);
                                }
                              }}
                              placeholder="Select Employee Name"
                            />
                          )}
                        />
                        {errors.employeeId && (
                          <p className="errorMsg">Employee Name Required</p>
                        )}
                      </div>
                    )}

                      <input
                        type="hidden"
                        className="form-control"
                        placeholder="Designation"
                        name="employeeName"
                        readOnly
                        {...register("employeeName")}
                      />

                      <input
                        type="hidden"
                        className="form-control"
                        placeholder="Designation"
                        name="employeeId"
                        readOnly
                        {...register("employeeId")}
                      />

                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Designation"
                        name="designationName"
                        readOnly
                        {...register("designationName", { required: true })}
                      />
                      {errors.designationName && (
                        <p className="errorMsg">Designation Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Department"
                        name="departmentName"
                        readOnly
                        {...register("departmentName", { required: true })}
                      />
                      {errors.departmentName && (
                        <p className="errorMsg">Department Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Hired</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Resignation Date"
                        name="dateOfHiring"
                        readOnly
                        {...register("dateOfHiring", { required: true })}
                      />
                      {errors.dateOfHiring && (
                        <p className="errorMsg">Date of Hiring Required</p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Date of Experience</label>
                      <input
                        type="date"
                        className="form-control"
                        placeholder="Last Working Date"
                        name="lastWorkingDate"
                        max={sixMonthsFromNow}
                        {...register("lastWorkingDate", { required: true })}
                      />
                      {errors.lastWorkingDate && (
                        <p className="errorMsg">Last Working Date Required</p>
                      )}
                    </div>

                    <div className="col-12 d-flex align-items-start mt-5">
                        {error && (
                          <div className="col-9 alert alert-danger text-center mt-4">
                            {error}
                          </div>
                        )}
                        <div className={`col-${error ? '3' : '12'} d-flex justify-content-end mt-4`}>
                          <button className="btn btn-secondary me-2" type="button" onClick={clearForm}>
                            Close
                          </button>
                          <button
                            className={isUpdating ? "btn btn-danger btn-lg" : "btn btn-primary btn-lg"}
                            type="submit"
                          >
                            {isUpdating ? "Update" : "Submit"}
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </form>
              {showPreview && (
            <div className={`modal fade ${showPreview ? 'show' : ''}`} style={{ display: showPreview ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-hidden={!showPreview}>
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content mt-2 mb-3">
                    <div className="modal-header">
                      <h5 className="modal-title">Preview Experience Letter</h5>
                      <button type="button" className="close" onClick={() => setShowPreview(false)} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <ExperiencePreview previewData={previewData} selectedTemplate={selectedTemplate} />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowPreview(false)}>Close</button>
                      <button type="button" className="btn btn-primary" onClick={handleConfirmSubmission}>Confirm Submission</button>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ExperienceForm;
