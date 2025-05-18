
export const Plantilla = () => {
	return (
		<div className="w-lg-500px bg-body rounded shadow-sm p-10 p-lg-15 mx-auto">
			{/* begin::Form */}
			<form
				className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
			>
				{/* begin::Heading */}
				<div className="text-center mb-10">
					{/* begin::Title */}
					<h1 className="text-dark mb-3">Sign In to Metronic</h1>
					{/* end::Title */}
					{/* begin::Link */}
					<div className="text-gray-400 fw-bold fs-4">
						New Here?
						<a
							href="../../demo6/dist/authentication/flows/basic/sign-up.html"
							className="link-primary fw-bolder"
						>
							Create an Account
						</a>
					</div>
					{/* end::Link */}
				</div>
				{/* end::Heading */}
				{/* begin::Input group */}
				<div className="fv-row mb-10 fv-plugins-icon-container">
					{/* begin::Label */}
					<label className="form-label fs-6 fw-bolder text-dark">Email</label>
					{/* end::Label */}
					{/* begin::Input */}
					<input
						className="form-control form-control-lg form-control-solid"
						type="text"
						name="email"
						autoComplete="off"
					/>
					{/* end::Input */}
					<div className="fv-plugins-message-container invalid-feedback"></div>
				</div>
				{/* end::Input group */}
				{/* begin::Input group */}
				<div className="fv-row mb-10 fv-plugins-icon-container">
					{/* begin::Wrapper */}
					<div className="d-flex flex-stack mb-2">
						{/* begin::Label */}
						<label className="form-label fw-bolder text-dark fs-6 mb-0">
							Password
						</label>
						{/* end::Label */}
						{/* begin::Link */}
						<a
							href="/home"
							className="link-primary fs-6 fw-bolder"
						>
							Forgot Password ?
						</a>
						{/* end::Link */}
					</div>
					{/* end::Wrapper */}
					{/* begin::Input */}
					<input
						className="form-control form-control-lg form-control-solid"
						type="password"
						name="password"
						autoComplete="off"
					/>
					{/* end::Input */}
					<div className="fv-plugins-message-container invalid-feedback"></div>
				</div>
				{/* end::Input group */}
				{/* begin::Actions */}
				<div className="text-center">
					{/* begin::Submit button */}
					<button
						type="submit"
						id="kt_sign_in_submit"
						className="btn btn-lg btn-primary w-100 mb-5"
					>
						<span className="indicator-label">Continue</span>
						<span className="indicator-progress">
							Please wait...
							<span className="spinner-border spinner-border-sm align-middle ms-2"></span>
						</span>
					</button>
					{/* end::Submit button */}
				
				</div>
				{/* end::Actions */}
			</form>
			{/* end::Form */}
		</div>
	);
};