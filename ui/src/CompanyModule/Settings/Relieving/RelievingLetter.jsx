import React, { useEffect, useMemo, useState } from "react";
import LayOut from "../../../LayOut/LayOut";
import {
  companyViewByIdApi,
  EmployeeGetApiById,
  TemplateGetAPI,
  TemplateSelectionPatchAPI,
} from "../../../Utils/Axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../Context/AuthContext";
import RelievingTemplate1 from "./RelievingTemplate1";
import RelievingTemplate2 from "./RelievingTemplate2";
import RelievingTemplate3 from "./RelievingTemplate3";

const RelievingLetter = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [companyData, setCompanyData] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [fetchedTemplate, setFetchedTemplate] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  const { user, logoFileName } = useAuth();
  const logo = "/assets/img/adapt_adapt_logo.png";

  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      setEmployeeDetails(response.data);
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  useEffect(() => {
    const userId = user.userId;
    setLoading(true);
    if (userId) {
      fetchEmployeeDetails(userId);
    }
    setLoading(false);
  }, [user.userId]);

  const fetchTemplate = async (companyId) => {
    try {
      const res = await TemplateGetAPI(companyId);
      const templateNo = res.data.data.relievingTemplateNo; // Get the experience template number
      setFetchedTemplate(res.data.data); // Store fetched data
      setIsFetched(true); // Mark template as fetched
      // Find the corresponding template and set it as selected
      const templateToSelect = templates.find(
        (template) => template.name === templateNo
      );
      if (templateToSelect) {
        setSelectedTemplate(templateToSelect);
        setActiveCardIndex(templates.indexOf(templateToSelect)); // Set the active card index
      }
    } catch (error) {
      handleApiErrors(error);
    }
  };

  useEffect(() => {
    if (companyData) {
      fetchTemplate(companyData.id);
    }
  }, [companyData]);

  const templates = useMemo(
    () => [
      {
        title: "Template 1",
        name: "1",
        content: (data) => (
          <RelievingTemplate1
            companyLogo={logoFileName}
            companyData={companyData}
            date="October 28, 2024"
            employeeName="John Doe"
            employeeId="E123456"
            designation="Software Engineer"
            joiningDate="January 1, 2020"
            resignationDate="September 27, 2024"
            lastWorkingDate="October 27, 2024"
            noticePeriod="3"
          />
        ),
      },
      {
        title: "Template 2",
        name: "2",
        content: (data) => (
          <RelievingTemplate2
            companyLogo={logoFileName}
            companyData={companyData}
            date="October 28, 2024"
            employeeName="John Doe"
            employeeId="E123456"
            designation="Software Engineer"
            joiningDate="January 1, 2020"
            resignationDate="September 27, 2024"
            lastWorkingDate="October 27, 2024"
            noticePeriod="2"
          />
        ),
      },
      {
        title: "Template 3",
        name: "3",
        content: (data) => (
          <RelievingTemplate3
            companyLogo={logoFileName}
            companyData={companyData}
            date="October 28, 2024"
            employeeName="John Doe"
            employeeId="E123456"
            designation="Software Engineer"
            joiningDate="January 1, 2020"
            resignationDate="September 27, 2024"
            lastWorkingDate="October 27, 2024"
            noticePeriod="4"
          />
        ),
      },
    ],
    [companyData, logo]
  );

  useEffect(() => {
    // Set default template as Template 1
    setSelectedTemplate(templates[0]);
    setActiveCardIndex(0); // Set the index of Template 1
  }, [templates]);

  const handleCardClick = (template, index) => {
    setSelectedTemplate(template);
    setActiveCardIndex(index);
    setIsFetched(false);
  };

  const handleSubmitTemplate = async () => {
    const dataToSubmit = {
      companyId: companyData.id, // Ensure this is correct
      relievingTemplateNo: selectedTemplate.name,
      // Add other necessary fields if required
    };
    try {
      const response = await TemplateSelectionPatchAPI(dataToSubmit);

      // Assuming a successful submission is indicated by the presence of a specific property
      if (response.data) {
        // Adjust this condition based on your API's response structure
        toast.success("Template submitted successfully!");
        setSelectedTemplate(null);
        setActiveCardIndex(null);
        setIsFetched(false);
      } else {
        toast.error("Failed to submit template");
      }
    } catch (error) {
      // Log the error for debugging
      console.error("API call error:", error);

      // Check if the error response has details
      if (error.response) {
        console.error("Response data:", error.response.data); // Log response data
        const errorMessage =
          error.response.data.error?.message || "An error occurred";

        toast.error(`${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      // toast.error("Network Error !");
    }
    console.error(error.response);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>RELIEVING CERTIFICATE</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">
                  RELIEVING CERTIFICATE
                </li>
              </ol>
            </nav>
          </div>
        </div>
        <div>
          <div className="row d-flex justify-content-evenly">
            {templates.map((template, index) => (
              <div
                className="col-md-3"
                key={index}
                onClick={() => handleCardClick(template, index)}
              >
                <div
                  className={`card mb-3 cursor-grab border ${
                    activeCardIndex === index ? "bg-light" : ""
                  }`}
                >
                  <div className="card-body">
                    <div className="row">
                      <div className="col mt-0">
                        <h5 className="card-title text-muted">
                          {template.title}
                        </h5>
                      </div>
                    </div>
                    <div className="mb-0">
                      <span className="text-muted">Click to view.</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedTemplate && (
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title text-center">
                  {selectedTemplate.title}
                </h5>
                {selectedTemplate.content("")}
                <div className="text-end">
                  {!isFetched && (
                    <>
                      <button
                        className="btn btn-secondary mt-3 me-2"
                        onClick={() => {
                          setSelectedTemplate(null);
                          setActiveCardIndex(null);
                          setIsFetched(false); // Reset fetched status
                        }}
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-primary mt-3"
                        type="button"
                        onClick={handleSubmitTemplate}
                      >
                        Select Template
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayOut>
  );
};

export default RelievingLetter;
